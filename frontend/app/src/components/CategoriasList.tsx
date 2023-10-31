import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import authHeader from "../services/auth-header";
import { Categoria } from "../types/categoria";
import swal from "sweetalert";
import { ResultsPage } from "../types/ResultsPage";
function CategoriasList() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [resultsPage, setResultsPage] = useState<ResultsPage<Categoria>>({
    content: [],
    totalPages: 0,
    last: false,
    first: true,
    size: 7,
    number: 0,
  });
  useEffect(() => {
    fetchAtributos();
  }, [showDeleted, resultsPage.number, resultsPage.size, categorias]);

  const fetchAtributos = () => {
    fetch(
      `/categorias?filtered=${showDeleted}&page=${resultsPage.number}&size=${resultsPage.size}`,
      {
        headers: authHeader(),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error al realizar la solicitud: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setResultsPage(responseData.data);
        console.log(responseData);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const handlePageChange = (newPage: number) => {
    setResultsPage({
      ...resultsPage,
      number: newPage,
    });
  };
  const pageNumbers = Array.from(Array(resultsPage.totalPages).keys()).map(
    (n) => n + 1
  );

  const handleEliminarTipoAgenda = (tipoAgendaId: number) => {
    swal({
      title: "¿Estás seguro?",
      text: "Una vez borrado, no podrás utilizar esta categoria.",
      icon: "warning",
      buttons: ["Cancelar", "Anular"],
      dangerMode: true,
    }).then((willAnular) => {
      if (willAnular) {
        fetch(`/categorias/delete/${tipoAgendaId}`, {
          method: "DELETE",
          headers: authHeader(),
        })
          .then((response) => {
            if (response.ok) {
              // Si la respuesta es exitosa, puedes realizar acciones adicionales aquí
              swal("La categoria ha sido anulada.", {
                icon: "success",
              }).then(() => {
                // Eliminar el tipoAgenda de la lista
                setCategorias((prevTipoAgendas) =>
                  prevTipoAgendas.filter(
                    (tipoAgenda) => tipoAgenda.id !== tipoAgendaId
                  )
                );
              });
            } else {
              // Si la respuesta no es exitosa, maneja el error aquí
              swal("Hay lotes activos con esa Categoria.", {
                icon: "error",
              }).then(() => {
                // Eliminar el tipoAgenda de la lista
              });
              console.error("Error al anular el lote");
            }
          })
          .catch((error) => {
            console.error("Error al anular el lote", error);
          });
      }
    });
  };
  const handleShowDeletedChange = () => {
    setShowDeleted(!showDeleted); // Alternar entre mostrar y ocultar elementos eliminados
  };
  const handleEliminarTipoAgenda1 = (tipoAgendaId: number) => {
    fetch(`/categorias/${tipoAgendaId}`, {
      method: "PUT",
      headers: authHeader(),
    })
      .then((response) => {
        if (response.ok) {
          setCategorias((prevTipoAgendas) =>
            prevTipoAgendas.filter(
              (tipoAgenda) => tipoAgenda.id !== tipoAgendaId
            )
          );
        } else {
          console.error("Error al anular el lote");
        }
      })
      .catch((error) => {
        console.error("Error al anular el lote", error);
      });
  };
  return (
    <div className="container">
      <h2>Categorias</h2>
      <div className="mb-3 form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          checked={showDeleted}
          onChange={handleShowDeletedChange}
        />
        <label className="form-check-label">Mostrar Eliminados</label>
      </div>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Codigo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {resultsPage.content.map((tipoAgenda, index) => (
              <tr key={tipoAgenda.id}>
                <td>{index + 1}</td>
                <td>{tipoAgenda.nombre}</td>
                <td>{tipoAgenda.codigo}</td>
                <td>
                  {!tipoAgenda.deleted ? (
                    <>
                      <Link
                        to={`/categorias/${tipoAgenda.id}`}
                        className="text-primary me-2"
                        title="Editar"
                      >
                        <i
                          className="bi bi-eye-fill"
                          style={{ fontSize: "1.5rem", cursor: "pointer" }}
                        ></i>
                      </Link>
                      <button
                        className="text-danger border-0 bg-transparent me-2"
                        onClick={() => handleEliminarTipoAgenda(tipoAgenda.id)}
                        title="Eliminar"
                      >
                        <i
                          className="bi bi-trash"
                          style={{ fontSize: "1.5rem", cursor: "pointer" }}
                        ></i>
                      </button>
                    </>
                  ) : (
                    <button
                      className="text-info border-0 bg-transparent me-2"
                      onClick={() => handleEliminarTipoAgenda1(tipoAgenda.id)}
                      title="Eliminar"
                    >
                      <i
                        className="bi bi-arrow-clockwise"
                        style={{ fontSize: "1.5rem", cursor: "pointer" }}
                      ></i>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!resultsPage.content.length && (
        <div className="alert alert-warning">No se encontraron lotes</div>
      )}
      <nav aria-label="Page navigation example">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <ul className="pagination">
              <li
                className={`page-item ${resultsPage.first ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(resultsPage.number - 1)}
                  disabled={resultsPage.first}
                >
                  &lsaquo;
                </button>
              </li>
              {pageNumbers.map((pageNumber) => (
                <li
                  key={pageNumber}
                  className={`page-item ${
                    pageNumber === resultsPage.number + 1 ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pageNumber - 1)}
                  >
                    {pageNumber}
                  </button>
                </li>
              ))}
              <li className={`page-item ${resultsPage.last ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(resultsPage.number + 1)}
                  disabled={resultsPage.last}
                >
                  &rsaquo;
                </button>
              </li>
            </ul>
          </div>
          <div className="input-group col-auto d-none d-md-flex align-items-center">
            <div className="input-group-text">Elementos por página</div>
            <input
              type="number"
              id="pageSizeInput"
              value={resultsPage.size}
              onChange={(e) =>
                setResultsPage({ ...resultsPage, size: +e.target.value })
              }
              className="form-control"
            />
          </div>
        </div>
      </nav>
    </div>
  );
}

export default CategoriasList;