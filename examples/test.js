var requirePhp = require('..');

requirePhp('test.php', function(err, test){
	console.log('module loaded');
	
	test.mult(4, 5, function(result){
		console.log('4 * 5 = %d', result);
		
		test.unref(); //unref the PHP module to let the program stop
	});
});
