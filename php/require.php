<?php

$path = $argv[1];
$port = $argv[2];

require_once 'dnode-php/vendor/autoload.php';

require_once $path;

$loop = new React\EventLoop\StreamSelectLoop();

$dnode = new DNode\DNode($loop, new Module());

$dnode->connect($port);

$loop->run();