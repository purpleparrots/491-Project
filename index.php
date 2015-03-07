
<!DOCTYPE html>
<html>
<head>
	<style>
		h1 {
			font-size: 28px;
			font-color: gray;
			font-family: Impact;
			text-align:center;
		}
		ul{
			text-align:center;
		}
		li {
			text-align:left;
		}
		table {
			width:100%;
		}
		th,td {
			font-family: Impact;
			border: 1px solid black;
			padding: 10px;
			text-align: center;
		}
		thead{
			background:gray;
		}
		#game{
			float:left;
		}
		canvas {
			position: absolute;
		}
		#highscores{
			width: 20%;
			margin: 0px 950px 0px;
		}
		#legend {
		}
		#control {
			width:70%;
		}
		#powerup {
			width:30%;
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

      <h1>League of Asteroids: Destruction of the Asteroids (DOTA)</h1>
	
</head>
<body>
   
    <div id="game">
 		<canvas left="0px" top="0px" id="next_background" tabindex="0" width="900" height="600" z-index="-2"></canvas>
 		<canvas left="0px" top="0px" id="background" tabindex="2" width="900" height="600" z-index="-1"></canvas>
     	<canvas left="0px" top="0px"id="gameWorld" tabindex="1" width="900" height="600" z-index="0"></canvas>
 		<canvas left="0px" top="0px"id="overlay" tabindex="3" width="900" height="600" z-index="1"></canvas>
	</div>
	<div>
		<table id="highscores">
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
				
				$dbhandle = mysql_connect($hostname, $username, $password) or die("Unable to connect to MySQL");
				
				$selected = mysql_select_db("alpertmd", $dbhandle) or die("Could not select high score db");
				
				$result = mysql_query("SELECT name, score FROM Highscores ORDER BY score DESC LIMIT 10");
				
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
	<br>
	<br>
	<br>
	<br>
	<br>
	<table id="legend">
			 <thead>
				 <tr>
   		 			 <th id="control"><h1>Controls</h1></th>
					 <th id="powerup" colspan="2"><h1>PowerUps</h1></th>
				 </tr>						 
			</thead>
			<tbody>
				<tr>
					<td>
			   			 <h2>
			       			 <ul>
								 <li>Click the game window to start and to pause</li>
			       				 <li>Up Arrow / Down Arrow - thrust</li>
			   					 <li>Left Arrow / Right Arrow - rotate ship </li>
			   					 <li>Space Bar - Fire main weapon</li>
			   					 <li>CTRL - Fire secondary weapon</li>
			   				 </ul>
						 </h2>
					</td>
					
					<td>
						<table>
				
							<tr>
								<td><img src="./images/red_crystal.png" /></td>
								<td>Bomb Upgrade</td>
							</tr>
							<tr>
								<td><img src="./images/blue_crystal.png" /></td>
								<td>Shield Upgrade</td>
							</tr>
							<tr>
								<td><img src="./images/tan_crystal.png" /></td>
								<td>Double Shot</td>
							</tr>
							<tr>
								<td><img src="./images/brown_crystal.png" /></td>
								<td>Triple Shot</td>
							</tr>
							<tr>
								<td><img src="./images/lime_green_crystal.png" /></td>
								<td>+1 Life</td>
							</tr>
							<tr>
								<td><img src="./images/purple_crystal.png" /></td>
								<td>Rear Shot</td>
							</tr>
						</table>
					</td>
				</tr>
			</tbody>
		</table>
</body>
</html>