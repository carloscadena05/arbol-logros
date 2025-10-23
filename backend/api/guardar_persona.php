<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(
    !empty($data->nombre) &&
    !empty($data->email) &&
    !empty($data->logros)
) {
    // Insertar persona
    $query = "INSERT INTO personas (nombre, email, telefono, fecha_nacimiento) 
              VALUES (:nombre, :email, :telefono, :fecha_nacimiento)";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":nombre", $data->nombre);
    $stmt->bindParam(":email", $data->email);
    $stmt->bindParam(":telefono", $data->telefono);
    $stmt->bindParam(":fecha_nacimiento", $data->fecha_nacimiento);
    
    if($stmt->execute()) {
        $persona_id = $db->lastInsertId();
        
        // Insertar logros
        foreach($data->logros as $logro) {
            $query_logro = "INSERT INTO logros (persona_id, titulo, descripcion, categoria, fecha_logro, nivel, padre_id) 
                           VALUES (:persona_id, :titulo, :descripcion, :categoria, :fecha_logro, :nivel, :padre_id)";
            
            $stmt_logro = $db->prepare($query_logro);
            $stmt_logro->bindParam(":persona_id", $persona_id);
            $stmt_logro->bindParam(":titulo", $logro->titulo);
            $stmt_logro->bindParam(":descripcion", $logro->descripcion);
            $stmt_logro->bindParam(":categoria", $logro->categoria);
            $stmt_logro->bindParam(":fecha_logro", $logro->fecha_logro);
            $stmt_logro->bindParam(":nivel", $logro->nivel);
            $stmt_logro->bindParam(":padre_id", $logro->padre_id);
            $stmt_logro->execute();
        }
        
        http_response_code(201);
        echo json_encode(array("message" => "Persona y logros guardados correctamente", "id" => $persona_id));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "No se pudo guardar la persona"));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Datos incompletos"));
}
?>