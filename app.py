from flask import Flask, redirect, url_for, render_template, request, session
from flask_socketio import SocketIO, send, emit
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.secret_key = 'my_key'
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.sqlite3"
socketio = SocketIO(app, cors_allowed_origins="*", manage_session=False)

db = SQLAlchemy(app)

class users(db.Model):
    _id = db.Column("id", db.Integer, primary_key=True)
    name = db.Column("name", db.String(100))

    def __init__(self, name):
        self.name = name

def add_users():
    michael = users("michael")
    thomas = users("thomas")
    jack = users("jack")
    kian = users("kian")
    arion = users("arion")
    alex = users("alex")
    izzy = users("izzy")

    db.session.add(michael)
    db.session.add(thomas)
    db.session.add(jack)
    db.session.add(kian)
    db.session.add(arion)
    db.session.add(alex)
    db.session.add(izzy)

    db.session.commit()


@app.route("/chat")
def chat():
    if "user" in session:
        user = session["user"]
        return render_template("chat.html", user=user)
    else:
        return redirect(url_for("login", status="fail"))


@app.route("/login/<status>", methods=["GET", "POST"])
def login(status):
    if request.method == "GET":
        if status == "new":

            mes = "Login Using First Name (all lowercase)"
            return render_template("login.html", message=mes)
        elif status == "fail":

            mes = "Login Failed, Try Again. Remember, all letters must be lowercase!"
            return render_template("login.html", message=mes)
    else:
        input_name = request.form["name"]

        # check if user exists in database
        user_exists = users.query.filter(users.name == input_name).first()
        if user_exists:
            # store name in session
            session["user"] = input_name

            return redirect(url_for("chat"))
        else:
            return redirect(url_for("login", status="fail"))


@app.route("/logout", methods=["GET"])
def logout():
    session.pop("user", None)
    return redirect(url_for("login", status="new"))

@socketio.on("ship-message")
def ship_message(data):
    # send back message to all clients
    emit("ship-message", data, broadcast=True)


@socketio.on("connect-message")
def connect_message():
    # send back current user in session
    emit("connect-message", session.get("user"))

# NOTE: only send message if message is not empty
@socketio.on("chat-message")
def chat_message(msg):
    #user = session["user"]
    user = session.get("user")
    send(f"{user}: {msg}", broadcast=True)


# @socketio.on("disconnect")
# def handle_disconnect():
#     #user = session["user"]
#     send(f"user disconnected", broadcast=True)


db.create_all()
if __name__ == '__main__':
    add_users()
    #socketio.run(app)
    app.run()