<?php 
	$username = "alpertmd";
	$password = "yofer`";
	$hostname = "repos.insttech.washington.edu";

	$dbhandle = mysql_connect($hostname, $username, $password) or die("Unable to connect to MySQL");
	$selected = mysql_select_db("alpertmd", $dbhandle) or die("Could not select high score db");
	
	$result = mysql_query("SELECT MIN(score) FROM Highscores");
	echo mysql_result($result, 0);	
?>
