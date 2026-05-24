package com.avaliacao.api.controller;

import com.avaliacao.api.dtos.TrainingImageRecordDTO;
import com.avaliacao.api.dtos.TrainingRecordDTO;
import com.avaliacao.api.models.TrainingModel;
import com.avaliacao.api.models.UserModel;
import com.avaliacao.api.service.TrainingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Set;
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
    public ResponseEntity<Object> CreateTraining(
            @RequestBody @Valid TrainingRecordDTO trainingRecordDTO){

        try {
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(trainingService.create(trainingRecordDTO));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(exception.getMessage());
        }
    }

    // implementação do méto do GetALL
    // Lista todos os produtos que temos na base
    @GetMapping
    public ResponseEntity<List<TrainingModel>> getAllTrainings(){
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(trainingService.findAll());
    }

    @GetMapping("/managers/{managerId}")
    public ResponseEntity<Object> getTrainingsByManager(
            @PathVariable(value = "managerId") UUID managerId){

        try {
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(trainingService.findByManager(managerId));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(exception.getMessage());
        }
    }

    @PostMapping("/managers/{managerId}")
    public ResponseEntity<Object> createTrainingForManager(
            @PathVariable(value = "managerId") UUID managerId,
            @RequestBody @Valid TrainingRecordDTO trainingRecordDTO){

        try {
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(trainingService.createForManager(managerId, trainingRecordDTO));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(exception.getMessage());
        }
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

        Optional<TrainingModel> tainingO;

        try {
            tainingO = trainingService.update(id,trainingRecordDTO);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(exception.getMessage());
        }

        if(tainingO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Training not found.");
        }
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(tainingO.get());
    }

    @PutMapping("/{id}/image")
    public ResponseEntity<Object> updateTrainingImage(@PathVariable(value = "id") UUID id,
                                                      @RequestBody @Valid TrainingImageRecordDTO trainingImageRecordDTO){

        Optional<TrainingModel> trainingO = trainingService.updateImage(id,trainingImageRecordDTO);

        if(trainingO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Training not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(trainingO.get());
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

    @PostMapping("/{trainingId}/users/{userId}")
    public ResponseEntity<Object> addUserToTraining(
            @PathVariable(value = "trainingId") UUID trainingId,
            @PathVariable(value = "userId") UUID userId){

        Optional<TrainingModel> trainingO = trainingService.addUser(trainingId,userId);

        if(trainingO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Training or user not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(trainingO.get());
    }

    @DeleteMapping("/{trainingId}/users/{userId}")
    public ResponseEntity<Object> removeUserFromTraining(
            @PathVariable(value = "trainingId") UUID trainingId,
            @PathVariable(value = "userId") UUID userId){

        Optional<TrainingModel> trainingO;

        try {
            trainingO = trainingService.removeUser(trainingId,userId);
        } catch (IllegalStateException exception) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(exception.getMessage());
        }

        if(trainingO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Training or user not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(trainingO.get());
    }

    @GetMapping("/{trainingId}/users")
    public ResponseEntity<Object> getTrainingUsers(
            @PathVariable(value = "trainingId") UUID trainingId){

        Optional<Set<UserModel>> usersO = trainingService.findUsersByTraining(trainingId);

        if(usersO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Training not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(usersO.get());
    }
}
