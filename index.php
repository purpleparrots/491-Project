
<!DOCTYPE html>
<html>
<head>
	<style>
		table, th, td {
			font-family: Impact;
			border: 1px solid black;
			width: 100%;
		}
		th, td {
			padding: 20px;
		}
		thead{
			background:grey;
		}
		th {
			text-align: center;
		}
		#game{
			float:left;
		}
		canvas {
			position: absolute;
		}
		#highscores{
			float:right;
			margin: 0px 100px 0px;
		}
		#scores{
			
		}
	</style>
    <meta charset="utf-8">
    <title>Game Project Shell</title>
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <script type= "text/javascript" src ="./AssetManager.js"></script>
	<script type ="text/javascript" src ="./Animation.js"></script>
	<script type ="text/javascript" src ="./main.js"></script>
	<script type ="text/javascript" src ="./SpaceObject.js"></script>
	<script type= "text/javascript" src ="./GameEngine.js"></script>
	
	
	
</head>
<body>
    <div id="game">
 		<canvas left="0px" top="0px" id="next_background" tabindex="0" width="900" height="600" z-index="-2"></canvas>
 		<canvas left="0px" top="0px" id="background" tabindex="2" width="900" height="600" z-index="-1"></canvas>
     	<canvas left="0px" top="0px"id="gameWorld" tabindex="1" width="900" height="600" z-index="0"></canvas>
 		<canvas left="0px" top="0px"id="overlay" tabindex="3" width="900" height="600" z-index="1"></canvas>
	</div>
	<div id="highscores">
		<table id="scores">
			<thead>
				<tr>
					<th colspan=2><h1>High Scores</h1></th>
				</tr>
			</thead>
			<tbody>
			<?php
				$username = "alpertmd";
				$password = "yofer`";
				$hostname = "repos.insttech.washington.edu";
				
				$dbhandle = mysql_connect($hostname, $username, $password) or die("Unable 					to connect to MySQL");
				
				$selected = mysql_select_db("alpertmd", $dbhandle) or die("Could not select high score db");
				
				$result = mysql_query("SELECT name, score FROM Highscores");
				
				while ($row = mysql_fetch_array($result,  MYSQL_NUM)){
					echo "<tr>";
					echo "<td> $row[0] </td>";
					echo "<td> $row[1] </td>";
					echo "</tr>";
				}
				
				mysql_close($dbhandle);
			
			?>
			</tbody>
		</table>
	</div>
</body>
</html>