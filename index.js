var path = require('path');
var net = require('net');
var spawn = require('child_process').spawn;
var dnode = require('dnode');

var PHP_ENTRY_SCRIPT = __dirname+'/php/require.php';
var parentModuleDir = path.dirname(module.parent.filename);

module.exports = requirePhp;

var loadedModules = {};

function requirePhp(modulePath, callback){
	var fullpath = path.resolve(parentModuleDir, modulePath);
	
	if(loadedModules[fullpath]){
		var module = loadedModules[fullpath];
		process.nextTick(function(){
			callback(module);
		});
	}else{
		createPhpModule(fullpath, function(err, module){
			if(err){
				return callback(err);
			}
			loadedModules[fullpath] = module;
			callback(null, module);
		});
	}
}

function createPhpModule(modulePath, callback){
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
		callback(null, remote);
	});
}