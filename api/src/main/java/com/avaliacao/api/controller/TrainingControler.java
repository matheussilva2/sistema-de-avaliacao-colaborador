package com.avaliacao.api.controller;


import com.avaliacao.api.dtos.TrainingRecordDTO;
import com.avaliacao.api.models.TrainingModel;
import com.avaliacao.api.repositories.TrainingRepository;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

// chore metodos http completos para trining

@RestController
public class TrainingControler {

    //para fazer a injeção da dependecia do repositório vamos usar essa notação de ponto de injeção
    // pode ser feito via contrutores também

    @Autowired
    TrainingRepository trainingRepository;

    // aqui podemos criar nossos métodos CRUD
    // POST: Recebe os atributos, faz uma validação inicial e insere na base de dados

    // para reber esses valores via Json é preciso Mapear os campos recebidos
    // usaremos os records para mapear esses objetos para a tranferência de dados
    //DTOS -> Data tranfer objects

    @PostMapping("/trainings")
    public ResponseEntity<TrainingModel> saveTrainig(@RequestBody @Valid TrainingRecordDTO trainingRecordDTO){
        var trainingModel = new TrainingModel();
        BeanUtils.copyProperties(trainingRecordDTO,trainingModel);
        return ResponseEntity.status(HttpStatus.CREATED).body(trainingRepository.save(trainingModel));
    }

    // implementação do méto do GetALL
    // Lista todos os produtos que temos na base

    @GetMapping("/trainings")
    public ResponseEntity<List<TrainingModel>> getAllTrainings(){
        return ResponseEntity.status(HttpStatus.OK).body(trainingRepository.findAll());
    }

    // GetOne -> Pegar um único recurs específico

    @GetMapping("/trainings/{id}")
    public ResponseEntity<Object> getOneProduct(@PathVariable(value = "id") UUID id){
        Optional<TrainingModel> trainingO = trainingRepository.findById(id);
        if(trainingO.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Training not found.");
        }

        return ResponseEntity.status(HttpStatus.OK).body(trainingO.get());
    }

    // meto do PUT para atualizar um produto baseado no ID

    @PutMapping("/trainings/{id}")

    public ResponseEntity<Object> updateProduct(@PathVariable(value = "id") UUID id,
                                  @RequestBody @Valid TrainingRecordDTO trainingRecordDTO){
        Optional<TrainingModel> tainingO = trainingRepository.findById(id);
        if(tainingO.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Training not found.");
        }

        var trainigModel = tainingO.get();
        BeanUtils.copyProperties(trainingRecordDTO,trainigModel);
        return ResponseEntity.status(HttpStatus.OK).body(trainingRepository.save(trainigModel));
    }

    // Meto do DELET

    @DeleteMapping("/trainings/{id}")
    public ResponseEntity<Object> deleteTraining(@PathVariable(value = "id") UUID id){
        Optional<TrainingModel> triningO = trainingRepository.findById(id);
        if(triningO.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Training not found.");
        }
        trainingRepository.delete(triningO.get());
        return ResponseEntity.status(HttpStatus.OK).body("Training deleted successfully");
    }
}
