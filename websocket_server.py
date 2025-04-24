import asyncio
import websockets
import serial
import json

# Serial connection to Arduino
try:
    ser = serial.Serial('/dev/ttyUSB0', 115200, timeout=1)
    print("Connected to /dev/ttyUSB0 at 115200 baud")
except Exception as e:
    print(f"Failed to connect to serial port: {e}")
    ser = None

# Store connected WebSocket clients
connected_clients = set()

async def handle_connection(websocket, path):
    print(f"Client connected: {websocket.remote_address}")
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            print(f"Received message from client: {message}")
            try:
                # Try parsing as JSON
                data = json.loads(message)
                if data.get("type") == "questcard_positions":
                    positions = data.get("positions", [])
                    if all(isinstance(p, int) and 1 <= p <= 48 for p in positions):
                        command = f"QUEST:{','.join(map(str, positions))}\n"
                        if ser and ser.is_open:
                            ser.write(command.encode())
                            print(f"Sent to Arduino: {command.strip()}")
                        else:
                            print("Serial port not available")
                    else:
                        print("Invalid questcard positions")
                elif data.get("type") == "piece_color":
                    color = data.get("color", [])
                    if len(color) == 3 and all(isinstance(c, int) and 0 <= c <= 255 for c in color):
                        command = f"COLOR:{color[0]},{color[1]},{color[2]}\n"
                        if ser and ser.is_open:
                            ser.write(command.encode())
                            print(f"Sent to Arduino: {command.strip()}")
                        else:
                            print("Serial port not available")
                    else:
                        print("Invalid color format")
                elif data.get("type") == "init_effect":
                    command = "INIT_EFFECT\n"
                    if ser and ser.is_open:
                        ser.write(command.encode())
                        print(f"Sent to Arduino: {command.strip()}")
                    else:
                        print("Serial port not available")
                else:
                    print("Unknown JSON message type")
            except json.JSONDecodeError:
                # Handle non-JSON messages (e.g., sensor IDs from Arduino)
                if message.isdigit():
                    sensor_id = message
                    print(f"Received sensor ID: {sensor_id}")
                    # Broadcast sensor ID to all connected clients
                    for client in connected_clients:
                        if client != websocket and client.open:
                            try:
                                await client.send(sensor_id)
                                print(f"Broadcasted sensor ID {sensor_id} to {client.remote_address}")
                            except Exception as e:
                                print(f"Error broadcasting to client: {e}")
                else:
                    print(f"Invalid message format: {message}")
    except websockets.exceptions.ConnectionClosed:
        print(f"Client disconnected: {websocket.remote_address}")
    finally:
        connected_clients.remove(websocket)

async def read_serial():
    while True:
        if ser and ser.is_open and ser.in_waiting > 0:
            try:
                message = ser.readline().decode('utf-8').strip()
                if message.isdigit():
                    print(f"Received sensor ID from Arduino: {message}")
                    # Broadcast sensor ID to all connected clients
                    for client in connected_clients:
                        if client.open:
                            try:
                                await client.send(message)
                                print(f"Broadcasted sensor ID {message} to {client.remote_address}")
                            except Exception as e:
                                print(f"Error broadcasting to client: {e}")
                elif message == "EFFECT_DONE":
                    print(f"Received EFFECT_DONE from Arduino")
                    # Broadcast EFFECT_DONE to all connected clients
                    for client in connected_clients:
                        if client.open:
                            try:
                                await client.send(message)
                                print(f"Broadcasted EFFECT_DONE to {client.remote_address}")
                            except Exception as e:
                                print(f"Error broadcasting to client: {e}")
                else:
                    print(f"Received unknown message from Arduino: {message}")
            except Exception as e:
                print(f"Error reading serial: {e}")
        await asyncio.sleep(0.01)

async def main():
    server = await websockets.serve(handle_connection, "0.0.0.0", 8765)
    print("WebSocket server started on ws://0.0.0.0:8765/")
    await asyncio.gather(server.wait_closed(), read_serial())

if __name__ == "__main__":
    asyncio.run(main())