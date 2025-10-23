<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(
    !empty($data->nombre) &&
    !empty($data->logros) &&
    count($data->logros) > 0
) {
    try {
        $db->beginTransaction();
        
        // Insertar persona (solo nombre)
        $query = "INSERT INTO personas (nombre) VALUES (:nombre)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":nombre", $data->nombre);
        
        if($stmt->execute()) {
            $persona_id = $db->lastInsertId();
            
            // Insertar logros (solo título y descripción)
            foreach($data->logros as $logro) {
                $query_logro = "INSERT INTO logros (persona_id, titulo, descripcion) 
                               VALUES (:persona_id, :titulo, :descripcion)";
                
                $stmt_logro = $db->prepare($query_logro);
                $stmt_logro->bindParam(":persona_id", $persona_id);
                $stmt_logro->bindParam(":titulo", $logro->titulo);
                $stmt_logro->bindParam(":descripcion", $logro->descripcion);
                $stmt_logro->execute();
            }
            
            $db->commit();
            http_response_code(201);
            echo json_encode(array(
                "message" => "Persona y logros guardados correctamente", 
                "id" => $persona_id,
                "success" => true
            ));
        } else {
            throw new Exception("No se pudo guardar la persona");
        }
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(503);
        echo json_encode(array(
            "message" => "Error al guardar: " . $e->getMessage(),
            "success" => false
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "message" => "Datos incompletos. Se requiere nombre y al menos un logro.",
        "success" => false
    ));
}
?>