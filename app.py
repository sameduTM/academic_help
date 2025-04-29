from flask import Flask, render_template, request, redirect, url_for, flash
from flask_mail import Mail, Message
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__, static_url_path='/static', static_folder='static')
app.config['SECRET_KEY'] = 'mysecretkey'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = 'your-email@gmail.com'  # Add your email
app.config['MAIL_PASSWORD'] = 'your-password'  # Add your password
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
mail = Mail(app)

db = SQLAlchemy(app)

# Database model for storing user details and orders


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    service = db.Column(db.String(100), nullable=False)
    pages = db.Column(db.Integer, nullable=False)
    due_date = db.Column(db.String(100), nullable=False)
    client_email = db.Column(db.String(150), nullable=False)


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/submit_order', methods=['POST'])
def submit_order():
    if request.method == 'POST':
        service = request.form['service']
        pages = int(request.form['pages'])
        due_date = request.form['due_date']
        client_email = request.form['email']

        new_order = Order(service=service, pages=pages,
                          due_date=due_date, client_email=client_email)
        db.session.add(new_order)
        db.session.commit()

        # Send email notification
        msg = Message('New Essay Help Order',
                      sender='your-email@gmail.com',
                      recipients=[client_email, 'your-email@gmail.com'])
        msg.body = f"New Order Details:\nService: {service}\nPages: {pages}\nDue Date: {due_date}"
        mail.send(msg)

        flash('Your order has been placed successfully!', 'success')
        return redirect('#order_section')

    return redirect('#order_section')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        return redirect(url_for('home'))
    return render_template('login.html')


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']
        return redirect('login')
    return render_template('signup.html')


if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Creates database tables
    app.run(debug=True)
