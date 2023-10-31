import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Categoria } from "../types/categoria";
import authHeader from "../services/auth-header";
import { Cultivar } from "../types/cultivar";

function CrearCultivar() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tipo, setTipo] = useState("Crear Cultivar");

  const [cantidadError, setCantidadError] = useState("");
  const [cultivar, setCultivar] = useState<Cultivar>({} as Cultivar);

  useEffect(() => {
    if (id != "new") {
      setTipo("Editar Cultivar");
      fetch(`/cultivares/id/${id}`, {
        headers: authHeader(),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Error al realizar la solicitud: ${response.status}`
            );
          }
          return response.json();
        })
        .then((responseData) => {
          setCultivar(responseData.data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, []);

  const guardarCultivar = () => {
    fetch(`/cultivares`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader().Authorization,
      },
      body: JSON.stringify(cultivar),
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 400) {
            // Es un error BadRequest
            throw new Error("Error de solicitud incorrecta (BadRequest)");
          } else {
            // Otro tipo de error
            throw new Error(
              `Error al realizar la solicitud: ${response.status}`
            );
          }
        }
        return response.json();
      })
      .then((data) => {
        console.log("Respuesta del servidor:", data);
        navigate(-1);
      })
      .catch((error) => {
        if (error.message === "Error de solicitud incorrecta (BadRequest)") {
          setCantidadError(
            "Ya existe cultivar con este codigo. Verifique los valores."
          );
        } else {
          setCantidadError(
            "Ya existe cultivar con este codigo. Verifique los valores."
          );
        }
      });
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setCultivar((prevLote) => ({
      ...prevLote,
      [name]: value,
    }));
  };

  const handleCancelar = () => {
    navigate(-1);
  };

  return (
    <div className="container">
      <form>
        <h2>{tipo} &nbsp;&nbsp; &nbsp;&nbsp;</h2>
        <div className="mb-3 col-12 col-lg-5">
          <label htmlFor="categoria" className="form-label">
            Nombre:
          </label>
          <input
            type="text"
            className="form-control"
            id="nombre"
            name="nombre"
            value={cultivar.nombre}
            onChange={handleInputChange}
            required
            disabled={id != "new"}
          />
        </div>
        <div className="mb-3 col-12 col-lg-5">
          <label htmlFor="fechaInicio" className="form-label">
            Codigo:
          </label>
          <input
            type="text"
            className="form-control"
            id="codigo"
            name="codigo"
            value={cultivar.codigo}
            onChange={handleInputChange}
            disabled={id != "new"}
          />
          {cantidadError && (
            <div className="alert alert-danger">{cantidadError}</div>
          )}
        </div>
        <ul></ul>
        <button
          type="button"
          className="btn btn-success"
          onClick={guardarCultivar}
        >
          Guardar
        </button>
        &nbsp;&nbsp;
        <button
          type="button"
          className="btn btn-danger ms-2"
          onClick={handleCancelar}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}

export default CrearCultivar;