<?php

print_r($_FILES);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (isset($_FILES['files'])) {
    $errors = [];
    $path = 'trails/';
    $extensions = ['json','geojson'];

    $all_files = count($_FILES['files']['tmp_name']);

    for ($i = 0; $i < $all_files; $i++) {
      $file_name = $_FILES['files']['name'][$i];
      $exploded = explode('.', $_FILES['files']['name'][$i]);
      
      $file = $path . $exploded[0] . '.json';

      if(file_exists($file)){
        $delete  = unlink($file);
        if($delete){
          echo "Delete success";
        }else{
          $errors[] = "Delete not success: "  . $file;
        }
      }
      
    }
    if ($errors) print_r($errors);
  }
}

?>