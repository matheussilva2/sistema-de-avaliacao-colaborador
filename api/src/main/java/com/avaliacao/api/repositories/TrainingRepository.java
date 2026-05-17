package com.avaliacao.api.repositories;

import com.avaliacao.api.models.TrainingModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;


@Repository
public interface TrainingRepository extends JpaRepository<TrainingModel, UUID> {

}

/*Bins do Spring:
* O Spring possui alguns esteriótipos onde podemos definir com determinadas classes são controladas
* @Component: Classe mais genérica
* @Service: Classes de serviços que trabalham com regras de Negócio
* @Repository: Mostra para o Spring, irá ter trasações com base de dados
* @Controler: Classes contoladoras com endpoints
* */

