package unpsjb.labprog.backend.presenter;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.model.Agenda;
import unpsjb.labprog.backend.model.Lote;
import unpsjb.labprog.backend.business.LoteService;
import unpsjb.labprog.backend.business.AgendaService;
import unpsjb.labprog.backend.business.TipoAgendaService;
import unpsjb.labprog.backend.business.CategoriaService;
import unpsjb.labprog.backend.business.ListaDeAtributosService;
import unpsjb.labprog.backend.business.UsuarioService;
import unpsjb.labprog.backend.business.ProcesoProgramadoService;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import unpsjb.labprog.backend.model.ProcesoProgramado;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("lotes")
public class LotePresenter {

  @Autowired
  LoteService service;

  @Autowired
  AgendaService serviceAgenda;

  @Autowired
  TipoAgendaService serviceTipoAgenda;

  @Autowired
  ProcesoProgramadoService serviceProcesoProgramado;

  @Autowired
  CategoriaService serviceCategoria;

  @Autowired
  UsuarioService serviceUsuario;

  @Autowired
  ListaDeAtributosService serviceListaDeAtributos;

  @RequestMapping(value = "/id/{id}", method = RequestMethod.GET)
  public ResponseEntity<Object> findById(@PathVariable("id") int id) {
    Lote loteOrNull = service.findById(id);
    return (loteOrNull != null) ? Response.ok(loteOrNull) : Response.notFound();
  }

  @RequestMapping(value = "/{code}", method = RequestMethod.GET)
  public ResponseEntity<Object> findByCode(@PathVariable("code") String code) {
    Lote loteOrNull = service.findByCode(code);
    return (loteOrNull != null) ? Response.ok(loteOrNull) : Response.notFound();
  }

  @GetMapping
  @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
  public ResponseEntity<Object> findAll(
      @RequestParam(value = "filtered", required = false) boolean filtered,
      @RequestParam(value = "term", required = false) String term) {
    return Response.ok(service.findAll(filtered, term));
  }

  @RequestMapping(value = "/activos/{id}", method = RequestMethod.GET)
  public ResponseEntity<Object> findAllActivos(@PathVariable("id") long id) {
    return Response.ok(service.findAllActivosByCategoria(serviceCategoria.findById(id)));
  }

  @RequestMapping(value = "/log/{id}", method = RequestMethod.GET)
  public ResponseEntity<Object> findById(@PathVariable("id") long id) {

    return Response.ok(service.findAllRevisions(id));
  }

  @PostMapping
  public ResponseEntity<Object> crear(@RequestBody Lote lote) {

    if (lote.getCategoria().getLimite() && lote.getLotePadre() != null) {

      Lote lotePadre = service.findById(lote.getLotePadre().getId());
      int totalCantidadSublotes = service.calculateTotalCantidadSublotes(lotePadre.getId());

      if (totalCantidadSublotes + lote.getCantidad() == lotePadre.getCantidad()) {

        lotePadre.setFechaDeBaja(LocalDate.now());

        service.update(lotePadre);
      }

      if (totalCantidadSublotes + lote.getCantidad() > lote.getLotePadre().getCantidad()) {
        return Response.badRequest("");
      }
    }

    List<ProcesoProgramado> procesosCopia = new ArrayList<>();
    LocalDate fechaActual = LocalDate.now();
    if (lote.getAgenda().getTipoAgenda() != null) {
      for (ProcesoProgramado procesoOriginal : lote.getAgenda().getTipoAgenda().getProcesosProgramado()) {
        for (int i = 0; i < procesoOriginal.getCantidad(); i++) {
          ProcesoProgramado procesoCopia = new ProcesoProgramado();
          procesoCopia.setCompletado(false);
          procesoCopia.setProceso(procesoOriginal.getProceso());

          LocalDate fechaARealizar = fechaActual
              .plusDays((procesoOriginal.getDiaInicio() - 1) + (procesoOriginal.getFrecuencia() * i));
          procesoCopia.setFechaARealizar(fechaARealizar);
          procesosCopia.add(serviceProcesoProgramado.add(procesoCopia));
        }

      }
      lote.getAgenda().setProcesosProgramado(procesosCopia);

    }
    lote.setAgenda(serviceAgenda.add(lote.getAgenda()));

    lote.setCodigo(service.generarCodigo(lote));

    return Response.ok(
        service.add(lote),
        "Lote creado correctamente");
  }

  @PutMapping
  public ResponseEntity<Object> update(@RequestBody Lote lote) {
    return Response.ok(service.update(lote), "Lote actualizado correctamente");
  }

  @DeleteMapping(value = "/delete/{id}")
  public void delete(@PathVariable("id") Long id) {
    Lote lote = service.findById(id);
    service.delete(id);
    if (lote.getLotePadre() != null) {
      Lote lotePadre = service.findById(lote.getLotePadre().getId());
      lotePadre.setFechaDeBaja(null);
      service.update(lotePadre);
    }
    // service.delete(id);
  }

  @GetMapping("/{loteId}/historia")
  public ResponseEntity<Object> obtenerLotesPadres(@PathVariable Long loteId) {
    return Response.ok(service.obtenerLotesPadres(loteId));
  }

  @GetMapping("/procesosPendientes")
  public ResponseEntity<Object> obtenerLotesPadres(@RequestParam(value = "term", required = false) String lote

      , @RequestParam(value = "dia", required = false) int dia) {
    return Response.ok(serviceProcesoProgramado.obtenerProcesosProgramadosPendientes(lote, dia));
  }

  @GetMapping("/search")
  public ResponseEntity<Object> search(@RequestParam(value = "term", required = false) String term

  // ,@RequestParam(value = "proceso", required = false) String proceso
  ) {
    List<String> resul = service.search(term);
    resul.addAll(serviceListaDeAtributos.search(term));
    return Response.ok(resul);
  }

  @RequestMapping(value = "/{id}/procesoprogramado", method = RequestMethod.PUT)
  public ResponseEntity<Object> findById(@PathVariable("id") long id,
      @RequestBody ProcesoProgramado procesoProgramado) {
    Lote loteOrNull = service.findById(id);
    Agenda agenda = loteOrNull.getAgenda();
    agenda.addprocesoProgramado(serviceProcesoProgramado.add(procesoProgramado));
    serviceAgenda.add(agenda);
    return (loteOrNull != null) ? Response.ok(loteOrNull) : Response.notFound();
  }

}
