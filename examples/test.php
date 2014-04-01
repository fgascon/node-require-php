<?php

class Module
{
    
    public function add($nb1, $nb2, $cb)
    {
        $cb($nb1 + $nb2);
    }
    
    public function mult($nb1, $nb2, $cb)
    {
        $cb($nb1 * $nb2);
    }
}