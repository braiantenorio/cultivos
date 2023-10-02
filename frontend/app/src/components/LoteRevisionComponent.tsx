import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { LoteRevision } from "../types/LoteRevision";

function LoteRevisiones() {
  const [lotesRevision, setLotesRevision] = useState<LoteRevision[]>([]);

  const { loteId } = useParams();

  const url = `/lotes/log/${loteId}`;

  useEffect(() => {
    fetch(url)
      .then((response) => response.json())
      .then((responseData) => {
        setLotesRevision(responseData.data);
      })
      .catch((error) => {
        console.error("Error al obtener los datos ", error);
      });
  }, []);

  return (
    <div>
      <div className="container">
        <h2>Logs de Lote</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Lote</th>
              <th>Cantidad</th>
              <th>Es Hoja</th>
              <th>Eliminado</th>
              <th>Fecha </th>
              <th>hora </th>
              <th>Usuario </th>
            </tr>
          </thead>
          <tbody>
            {lotesRevision.map((revision, index) => (
              <tr key={index}>
                <td>{revision.entidad.codigo}</td>
                <td>{revision.entidad.cantidad}</td>
                <td>{revision.entidad.esHoja ? "Sí" : "No"}</td>
                <td>{revision.entidad.deleted ? "Sí" : "No"}</td>
                <td>
                  {new Date(revision?.revisionDate).toLocaleDateString()}{" "}
                </td>
                <td>{new Date(revision?.revisionDate).toLocaleTimeString()}</td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LoteRevisiones;