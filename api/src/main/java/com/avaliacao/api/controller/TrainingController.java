package com.avaliacao.api.controller;

import com.avaliacao.api.dtos.TrainingRecordDTO;
import com.avaliacao.api.models.TrainingModel;
import com.avaliacao.api.service.TrainingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

// chore metodos http completos para trainig

@RestController
@RequestMapping("/trainings")
public class TrainingController {

    private final TrainingService trainingService;

    public TrainingController(TrainingService trainingService){
        this.trainingService = trainingService;
    }

    //para fazer a injeção da dependecia do repositório vamos usar essa notação de ponto de injeção
    // pode ser feito via contrutores também

//    @Autowired
//    TrainingRepository trainingRepository;

    // aqui podemos criar nossos métodos CRUD
    // POST: Recebe os atributos, faz uma validação inicial e insere na base de dados

    // para reber esses valores via Json é preciso Mapear os campos recebidos
    // usaremos os records para mapear esses objetos para a tranferência de dados
    //DTOS -> Data tranfer objects

    // Implementação do metodo Post
    @PostMapping
    public ResponseEntity<TrainingModel> CreateTraining(
            @RequestBody @Valid TrainingRecordDTO trainingRecordDTO){

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(trainingService.create(trainingRecordDTO));
    }

    // implementação do méto do GetALL
    // Lista todos os produtos que temos na base
    @GetMapping
    public ResponseEntity<List<TrainingModel>> getAllTrainings(){
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(trainingService.findAll());
    }

    // GetOne -> Pegar um único recurs específico
    @GetMapping("/{id}")
    public ResponseEntity<Object> getOneTraining(@PathVariable(value = "id") UUID id){
        Optional<TrainingModel> trainingO = trainingService.findById(id);

        if(trainingO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Training not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(trainingO.get());
    }

    // meto do PUT para atualizar um produto baseado no ID
    @PutMapping("/{id}")
    public ResponseEntity<Object> updateTrainig(@PathVariable(value = "id") UUID id,
                                                @RequestBody @Valid TrainingRecordDTO trainingRecordDTO){

        Optional<TrainingModel> tainingO = trainingService
                .update(id,trainingRecordDTO);

        if(tainingO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Training not found.");
        }
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(tainingO.get());
    }


    // Meto do DELET
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteTraining(@PathVariable(value = "id") UUID id){
        boolean status = trainingService.delete(id);

        if(!status){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Training not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body("Training deleted successfully");
    }
}
