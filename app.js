const mysql = require('mysql');
const express = require('express');
const session = require('express-session');/*de este modo podremos acceder a los datos de sesión de la petición. */
const path = require('path');


const connection = mysql.createConnection({/*es la conecciona a la base de datos */
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'loginbase'
});

const app = express();

app.use(session({/* Para ello necesitas configurar una clave secreta. */
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));
app.set("view engine","pug");
app.set('views', path.join(__dirname,'views'));

// http://localhost:4000/
app.get('/', function(request, response) {
	// Render login template
	response.render(path.join(__dirname +'/views/login.pug'));
	
});

// http://localhost:4000/auth
/*Para acceder a la sesión accedemos a req.session en donde req también es llamada petición o request. Así de simple; todo esto usando JavaScript del lado del cliente. */
app.post('/auth', function(request, response) {
	// Capture the input fields
	let username = request.body.username;
	let password = request.body.password;
	// Asegúrese de que los campos de entrada existan y no estén vacíos
	if (username && password) {
		// Ejecute una consulta SQL que seleccionará la cuenta de la base de datos en función del nombre de usuario y la contraseña especificados
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			// Si hay un problema con la consulta, genere el error
			if (error) throw error;
			//  Si la cuenta existe
			if (results.length > 0) {
				// Autenticar al usuario
				request.session.loggedin = true;
				request.session.username = username;
				// Redirigir a la página de inicio
				response.redirect('/home');
			} else {
				response.send('Usuario y/o Contraseña Incorrecta, Fuera de aqui');
			}			
			response.end();
		});
	} else {
		response.send('Por favor ingresa Usuario y Contraseña!');
		response.end();
		
	}
});

// http://localhost:3000/home
app.get('/home', function(request, response) {
	// Si el usuario ha iniciado sesión
	if (request.session.loggedin) {
		// Nombre de usuario de salida
		response.send('Hola,Te has logueado satisfactoriamente:, ' + request.session.username + '!');
	} else {
		// No ha iniciado sesión
		response.send('¡Inicia sesión para ver esta página!');
	}
	response.end();
});

app.listen(4000);