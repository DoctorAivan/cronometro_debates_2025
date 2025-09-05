import eventlet
eventlet.monkey_patch()

import math
import time
from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS

# Globals Settings
SECRET_KEY = "h5j46k73jfhsfh455wt$&#*$hjyjruyk5"
ALLOWED_ORIGINS = "*"
PING_INTERVAL = 20
PING_TIMEOUT = 30
MAX_HTTP_BUFFER_SIZE = 1000000

app = Flask(__name__)
app.config["SECRET_KEY"] = SECRET_KEY

# CORS Settings
origins = [o.strip() for o in ALLOWED_ORIGINS.split(",")] if ALLOWED_ORIGINS != "*" else "*"
CORS(app, resources={"/*": {"origins": origins}})

# SocketIO Settings
socketio = SocketIO(
    app,
    cors_allowed_origins=origins,
    async_mode="eventlet",
    ping_interval=PING_INTERVAL,
    ping_timeout=PING_TIMEOUT,
    max_http_buffer_size=MAX_HTTP_BUFFER_SIZE,
)

#       -       -       -       -       -       -       -       -       -

# Clock object list
clock = {}

# APP Settings
CLOCKS = 8
TIMELIMIT = 120
ORDER = "DESC"
STATUS = "on"

#       -       -       -       -       -       -       -       -       -

# Clock
class Clock:

    # Constructor
    def __init__(self, id_, sio):
        self.id = id_
        self.sio = sio
        self.is_playing = False
        self.is_paused = False
        self.last_time = 0
        self.elapsed_time = 0
        self.overtime = 0
        self._started = False

    # Init functions

    def second_pulse(self):
        while True:
            if self.is_playing:
                now = math.floor(time.time())
                
                # Validate time limit and overtime
                if (TIMELIMIT + self.overtime) <= self.elapsed_time:
                    self.elapsed_time = (TIMELIMIT + self.overtime)
                    self.is_playing = False
                    self.is_paused = True
                    self.sio.emit("pause_single", {"id": self.id})

                else:
                    self.elapsed_time += now - self.last_time
                    self.is_playing = True
                    self.is_paused = False
                    self.sio.emit("elapsed", {"id": self.id, "elapsed": self.elapsed_time})

                self.last_time = now

            self.sio.sleep(1)

    def clock_data(self):
        return {"id": self.id, "status": self.is_playing, "time": self.elapsed_time, "overtime": self.overtime}

    # Single functions

    def ensure_started(self):
        if not self._started:
            self.sio.start_background_task(self.second_pulse)
            self._started = True

    def play_single(self):
        if self.is_playing:
            return
        
        self.last_time = math.floor(time.time())
        self.is_playing = True
        self.is_paused = False
        self.sio.emit("play_single", {"id": self.id})

    def pause_single(self):
        self.is_playing = False
        self.is_paused = True
        self.sio.emit("pause_single", {"id": self.id})

    def reset_single(self):
        self.elapsed_time = 0
        self.overtime = 0
        self.is_playing = False
        self.sio.emit("reset_single", {"id": self.id})

    def overtime_single(self, elapsed):
        self.overtime = int(elapsed or 0)

        # Assign new overtime
        self.sio.emit("overtime_single", {"id": self.id, "overtime": self.overtime})

    # Group functions

    def pause(self):
        self.is_playing = False
        self.is_paused = True

    def reset(self):
        self.elapsed_time = 0
        self.overtime = 0
        self.is_playing = False

# SOCKET ENDPOINTS
#       -       -       -       -       -       -       -       -       -

# GLOBAL FUNCTIONS

# Return clocks object status
@socketio.on("connect")
def on_connect():
    data = {
        "timelimit": TIMELIMIT,
        "order": ORDER,
        "status": STATUS,
        "clocks": [c.clock_data() for c in clock.values()],
    }
    socketio.emit("init", data)

# Set clocks order
@socketio.on("order")
def order_clock(order):
    global ORDER
    ORDER = str(order)
    socketio.emit("order", ORDER)

# Set container status
@socketio.on("status")
def status_clock(status):
    global STATUS
    STATUS = str(status)
    socketio.emit("status", STATUS)

#       -       -       -       -       -       -       -       -       -

# SINGLE FUNCTIONS

# Play single clock
@socketio.on("fn_play_single")
def fn_play_single(id_):
    c = clock.get(int(id_))
    if c:
        c.play_single()

# Pause single clock
@socketio.on("fn_pause_single")
def fn_pause_single(id_):
    c = clock.get(int(id_))
    if c:
        c.pause_single()

# Reset single clock
@socketio.on("fn_reset_single")
def fn_reset_single(id_):
    c = clock.get(int(id_))
    if c:
        c.reset_single()

# Set overtime single clock
@socketio.on("fn_overtime_single")
def fn_overtime_single(id_, elapsed):
    c = clock.get(int(id_))
    if c:
        c.overtime_single(int(elapsed))

#       -       -       -       -       -       -       -       -       -

# GROUPS FUNCTIONS

# Set time limit for all clocks
@socketio.on("fn_global_time")
def fn_global_time(limit):
    global TIMELIMIT
    TIMELIMIT = int(limit)

    for c in clock.values():
        c.reset()

    socketio.emit("global_time", TIMELIMIT)

# Pause all clocks
@socketio.on("fn_pause_all")
def fn_pause_all():
    for c in clock.values():
        c.pause()

    socketio.emit("pause_all", True)

# Reset all clocks
@socketio.on("fn_reset_all")
def fn_reset_all():
    for c in clock.values():
        c.reset()

    socketio.emit("reset_all", True)

#       -       -       -       -       -       -       -       -       -

# INIT APP

# APP for time control
def init_crono_app():

    # Create clock object list
    for id_ in range(1, CLOCKS + 1):
        c = Clock(id_, socketio)
        c.ensure_started()
        clock[id_] = c

# Init APP
init_crono_app()

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)