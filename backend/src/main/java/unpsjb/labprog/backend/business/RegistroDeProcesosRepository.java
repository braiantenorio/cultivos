package unpsjb.labprog.backend.business;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.RegistroDeProcesos;

import org.springframework.data.repository.PagingAndSortingRepository;

@Repository
public interface RegistroDeProcesosRepository extends CrudRepository<RegistroDeProcesos, Long>,
        PagingAndSortingRepository<RegistroDeProcesos, Long> {
        
         List<RegistroDeProcesos> findAllByLoteId(Long loteId);

}