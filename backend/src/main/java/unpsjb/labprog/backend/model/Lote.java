package unpsjb.labprog.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale.Category;

import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;
import org.hibernate.envers.RelationTargetAuditMode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.PostPersist;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import unpsjb.labprog.backend.business.UsuarioRepository;
import unpsjb.labprog.backend.business.UsuarioService;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "Lotes")
@SQLDelete(sql = "UPDATE Lotes SET deleted = true, lote_padre_id = null  WHERE id=?")
@Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
@FilterDef(name = "deletedLoteFilter", parameters = {
		@ParamDef(name = "isDeleted", type = boolean.class),
		@ParamDef(name = "codigo", type = String.class)
})
@Filter(name = "deletedLoteFilter", condition = "deleted = :isDeleted AND (:codigo IS NOT NULL AND UPPER(codigo) LIKE UPPER(:codigo))")
@JsonIgnoreProperties(value = { "lotePadre" }, allowSetters = true)
@EntityListeners(AuditingEntityListener.class)
public class Lote {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@Column(nullable = false, unique = true)
	private String codigo;

	@Column(nullable = false)
	private int cantidad;

	@NotAudited
	@ManyToOne
	@JoinColumn(name = "categoria_id", nullable = false)
	private Categoria categoria;

	@NotAudited
	@ManyToOne
	@JoinColumn(name = "cultivar_id", nullable = false)
	private Cultivar cultivar;

	@NotAudited
	@OneToOne
	@JoinColumn(name = "agenda_id")
	private Agenda agenda;

	@CreatedBy
	@ManyToOne
	private Usuario usuario; // sino usemos la propia logica, usando un find by id digo pero sacando el id de
								// security context

	private boolean deleted = Boolean.FALSE;

	private boolean esHoja = Boolean.TRUE; // Cuando lo creamos es activo no?

	private LocalDate fecha; // cuando se cree poner la fecha del dia

	@ManyToOne // (fetch = FetchType.LAZY) // (fetch = FetchType.EAGER)
	private Lote lotePadre;

	@JsonIgnore
	@NotAudited
	@OneToMany(mappedBy = "lotePadre")
	private List<Lote> subLotes = new ArrayList<>();

	@ManyToMany(cascade = { CascadeType.PERSIST, CascadeType.MERGE })
	@JoinTable(name = "Registro_de_procesos", joinColumns = @JoinColumn(name = "lote_id"), inverseJoinColumns = @JoinColumn(name = "proceso_id"))
	List<Proceso> procesos = new ArrayList<>();

	public void addProceso(Proceso proceso) {
		procesos.add(proceso);
		proceso.getLotes().add(this);
	}

	public void removeProceso(Proceso proceso) {
		procesos.remove(proceso);
		proceso.getLotes().remove(this);
	}

	@PrePersist
	public void prePersist() {

		fecha = LocalDate.now();

	}

	@PreUpdate
	public void prePersistUser() {

	}
	/* */
}
