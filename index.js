var path = require('path');
var net = require('net');
var spawn = require('child_process').spawn;
var dnode = require('dnode');

var PHP_ENTRY_SCRIPT = __dirname+'/php/require.php';

module.exports = requirePhp;

var loadedModules = {};

function requirePhp(modulePath, callback){
	var absoluteModulePath = path.resolve(modulePath);
	if(loadedModules[absoluteModulePath]){
		var module = loadedModules[absoluteModulePath];
		process.nextTick(function(){
			callback(module);
		});
	}else{
		createPhpModule(absoluteModulePath, function(module){
			loadedModules[absoluteModulePath] = module;
			callback(module);
		});
	}
}

function createPhpModule(modulePath, callback){
	console.log(modulePath);
	var d = dnode();
	var server = net.createServer(function(connection){
		d.pipe(connection).pipe(d);
		connection.unref();
	});
	server.listen(0, '127.0.0.1', function(){
		var port = server.address().port;
		
		var childProcess = spawn('php', [PHP_ENTRY_SCRIPT, modulePath, port], {
			stdio: ['ignore', null, null]
		});
		childProcess.stdout.pipe(process.stdout);
		childProcess.stderr.pipe(process.stderr);
		childProcess.stdout.unref();
		childProcess.stderr.unref();
		childProcess.on('error', function(err){
			console.error(err);
		});
		childProcess.on('exit', function(code){
			console.log("Process exited with code %d", code);
			server.close();
		});
		childProcess.unref();
	});
	
	d.on('remote', function(remote){
		remote.unref = function(){
			server.unref();
		};
		remote.close = function(){
			server.close();
		};
		callback(remote);
	});
}