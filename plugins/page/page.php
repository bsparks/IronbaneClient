<?php
/*
    This file is part of Ironbane MMO.

    Ironbane MMO is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Ironbane MMO is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Ironbane MMO.  If not, see <http://www.gnu.org/licenses/>.
*/



if ( !defined('BCS') ) {
	die("ERROR");
}



$page = isset($_GET['page']) ? parseToDB($_GET['page']) : $page;

if ( !isset($page) ) {
	die();
}

if ( !is_numeric($page) ) {
	die();
}



$query = "SELECT * FROM bcs_pages WHERE id='$page'";
$result = mysql_query($query) or bcs_error("<b>SQL ERROR</b> in <br>file " . __FILE__ . " on line " . __LINE__ . "<br><br><b>" . $query . "</b><br><br>" . mysql_error());
$row = mysql_fetch_array($result);

$queryb = "SELECT * FROM bcs_users WHERE id='$row[madeby]'";
$resultb = mysql_query($queryb) or bcs_error("<b>SQL ERROR</b> in <br>file " . __FILE__ . " on line " . __LINE__ . "<br><br><b>" . $query . "</b><br><br>" . mysql_error());
$rowb = mysql_fetch_array($resultb);

$c_title = $row["title"];



	$c_main = '

<h1>'.$row["title"].'</h1>

'.$row["content"].'


';






?>
