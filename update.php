<?php
	$name = $_GET["name"];
	$score = $_GET["score"];
	
	$username = "alpertmd";
	$password = "yofer`";
	$hostname = "repos.insttech.washington.edu";

	$dbhandle = mysql_connect($hostname, $username, $password) or die("Unable to connect to MySQL");

	$selected = mysql_select_db("alpertmd", $dbhandle) or die("Could not select high score db");
	
	$result = mysql_query("SELECT MAX(idHighscores) FROM Highscores");
	$id = mysql_result($result, 0) + 1;
	$query = "INSERT INTO Highscores VALUES ($id, '$name', $score)";
	echo $query;
	$result = mysql_query($query);
	
	mysql_close($dbhandle);
?>