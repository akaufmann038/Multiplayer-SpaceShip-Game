from flask import Flask, redirect, url_for, render_template, request, session
from flask_socketio import SocketIO, send
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SECRET_KEY"] = 'my_key'
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.sqlite3"
socketio = SocketIO(app)

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

@socketio.on('message')
def handle_message(data):
    if data == "User is connected!":
        user = session["user"]
        send(f'{user} has joined', broadcast=True)
    else:
        send(data, broadcast=True)

@socketio.on("disconnect")
def handle_disconnect():
    user = session["user"]
    send(f"{user} has left", broadcast=True)

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


db.create_all()
if __name__ == '__main__':
    add_users()
    #app.run(debug=True)
    socketio.run(app)