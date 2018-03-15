var express = require('express');
var app = express();
var url = require('url');
var path = require('path');
var bodyParser = require('body-parser');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var num = 0;
io.on('connection', function(cliente) {
	num++;
	console.log('Cliente conectado '+num );
	cliente.on('mensajeChat', function(datos){
		console.log('Se han enviado datos al chat');
		cliente.broadcast.emit('mensajeChat', datos);
	});
});


var paginas = [
	{ruta: '/', fichero:'/index.html', prueba: false},
	{ruta: '/producto/:nombre', prueba: true},
	{ruta: '/reset'}
];

var productos = [
	{nombre: 'Toro', disponible: true, descripcion: 'Un toro un poco escuchimizado', cantidad: 11, precio: 15},
	{nombre: 'Lemur', disponible: true, descripcion: 'El mono mas mono. Tienen el ego subido desde que salieron en Madagascar', cantidad: 11, precio: 10},
	{nombre: 'Kiwi', disponible: true, descripcion: 'Importante!! No confundir con la fruta, este bicho se supone que es un pajaro o algo asi', cantidad: 11, precio: 5}
];


app.get('/', function(request, response){
	var camino = path.join(__dirname+'/index.html');
	response.sendFile(camino);
});

app.post('/producto/:nombre', function(request, response){
	productos.some(function(objeto){
		var nombre = objeto.nombre;
		if (objeto.cantidad <= 0){
				objeto.disponible = false;
		}
		if (nombre == request.params.nombre){
			app.set('view engine', 'pug');
			response.render('productos.pug', objeto);
			return true;
		}else{
			return false;
		}
	});					
});

app.post('/actualizarProducto/:nombre', function(request, response){
	productos.some(function(objeto){
		var nombre = objeto.nombre;
		var nombrePagina = request.params.nombre
		if (nombre == nombrePagina){
			console.log(request.body.cantidad);
			var cantidadPedida = request.body.cantidad
			objeto.cantidad = objeto.cantidad - cantidadPedida;
			if (objeto.cantidad <= 0){
				objeto.disponible = false;
			}
			console.log('Se ha actualizado un producto');
			response.sendStatus(200);
			return true;
		}else{
			return false;
		}
	});

});

app.get('/reset', function(request, response){
	productos.forEach(function(producto){
		producto.cantidad = 11;
	});
	response.redirect('/');
});


app.listen(port, function (argument) {
	console.log('Escuchando en el puerto');
});

server.listen();