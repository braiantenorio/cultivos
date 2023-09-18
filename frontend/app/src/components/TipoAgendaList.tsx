import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { TipoAgenda } from "../types/tipoAgenda";
import swal from "sweetalert";

function TipoAgendaList() {
  const [tipoAgendas, setTipoAgendas] = useState<TipoAgenda[]>([]);

  useEffect(() => {
    const url = "/tipoagendas";

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error al realizar la solicitud: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setTipoAgendas(responseData.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);
  const handleEliminarTipoAgenda = (tipoAgendaId: number) => {
    swal({
      title: "¿Estás seguro?",
      text: "Una vez anulado, no podrás recuperar este lote.",
      icon: "warning",
      buttons: ["Cancelar", "Anular"],
      dangerMode: true,
    }).then((willAnular) => {
      if (willAnular) {
        fetch(`/tipoagendas/delete/${tipoAgendaId}`, {
          method: "DELETE",
        })
          .then((response) => {
            if (response.ok) {
              // Si la respuesta es exitosa, puedes realizar acciones adicionales aquí
              swal("El lote ha sido anulado.", {
                icon: "success",
              }).then(() => {
                // Eliminar el tipoAgenda de la lista
                setTipoAgendas((prevTipoAgendas) =>
                  prevTipoAgendas.filter(
                    (tipoAgenda) => tipoAgenda.id !== tipoAgendaId
                  )
                );
              });
            } else {
              // Si la respuesta no es exitosa, maneja el error aquí
              console.error("Error al anular el lote");
            }
          })
          .catch((error) => {
            // Maneja cualquier error que ocurra durante la solicitud HTTP
            console.error("Error al anular el lote", error);
          });
      }
    });
  };

  return (
    <div className="container">
      <h2>Agendas </h2>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Categoria</th>
            <th>Version</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tipoAgendas.map((tipoAgenda, index) => (
            <tr key={tipoAgenda.id}>
              <td>{index + 1}</td>
              <td>{tipoAgenda.categoria}</td>
              <td>{tipoAgenda.version}</td>
              <td>
                <Link
                  to={`/agendas/${tipoAgenda.id}`}
                  className="btn btn-sm btn-warning me-2"
                >
                  Editar
                </Link>
                &nbsp;&nbsp;
                <button
                  className="btn btn-sm btn-danger me-2"
                  onClick={() => handleEliminarTipoAgenda(tipoAgenda.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TipoAgendaList;
