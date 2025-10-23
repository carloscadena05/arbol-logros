<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$query = "SELECT p.id as persona_id, p.nombre,
                 l.id as logro_id, l.titulo, l.descripcion
          FROM personas p
          LEFT JOIN logros l ON p.id = l.persona_id
          ORDER BY p.id, l.id";

$stmt = $db->prepare($query);
$stmt->execute();

$personas = array();

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $persona_id = $row['persona_id'];
    
    if(!isset($personas[$persona_id])) {
        $personas[$persona_id] = array(
            'id' => $persona_id,
            'nombre' => $row['nombre'],
            'logros' => array()
        );
    }
    
    if($row['logro_id']) {
        $personas[$persona_id]['logros'][] = array(
            'id' => $row['logro_id'],
            'titulo' => $row['titulo'],
            'descripcion' => $row['descripcion']
        );
    }
}

http_response_code(200);
echo json_encode(array(
    "success" => true,
    "data" => array_values($personas)
));
?>