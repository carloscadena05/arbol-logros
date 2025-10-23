<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$query = "SELECT p.id as persona_id, p.nombre, p.email, 
                 l.id as logro_id, l.titulo, l.descripcion, l.categoria, 
                 l.fecha_logro, l.nivel, l.padre_id
          FROM personas p
          LEFT JOIN logros l ON p.id = l.persona_id
          ORDER BY p.id, l.nivel, l.fecha_logro";

$stmt = $db->prepare($query);
$stmt->execute();

$personas = array();

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $persona_id = $row['persona_id'];
    
    if(!isset($personas[$persona_id])) {
        $personas[$persona_id] = array(
            'id' => $persona_id,
            'nombre' => $row['nombre'],
            'email' => $row['email'],
            'logros' => array()
        );
    }
    
    if($row['logro_id']) {
        $personas[$persona_id]['logros'][] = array(
            'id' => $row['logro_id'],
            'titulo' => $row['titulo'],
            'descripcion' => $row['descripcion'],
            'categoria' => $row['categoria'],
            'fecha_logro' => $row['fecha_logro'],
            'nivel' => $row['nivel'],
            'padre_id' => $row['padre_id']
        );
    }
}

http_response_code(200);
echo json_encode(array_values($personas));
?>