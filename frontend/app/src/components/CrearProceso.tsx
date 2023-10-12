import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Atributo } from "../types/atributo";
import { Proceso } from "../types/proceso";
import { Valor } from "../types/valor";
import { TipoDeProceso } from "../types/tipoDeProceso";
import authHeader from "../services/auth-header";

function CrearProceso() {
  const { listId } = useParams();
  const { loteId } = useParams();
  const [valores, setValores] = useState<Valor[]>([]);
  const [tipoDeProceso, setTipoDeProceso] = useState<TipoDeProceso>(
    {} as TipoDeProceso
  ); // aca falta asignar hay que arreglar
  const [tiposDeProcesos, setTiposDeProcesos] = useState<TipoDeProceso[]>([]);
  const [selectsHabilitados, setSelectsHabilitados] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (listId !== "new") {
      fetch(`/listaDeAtributos/nombre/${listId}`, {
        headers: authHeader(),
      })
        .then((response) => response.json())
        .then((data) => {
          setTipoDeProceso(data.data);
          const valoresData: Valor[] = data.data.atributos.map(
            (atributo: Atributo) => ({
              id: null,
              atributo: atributo,
              valor: null,
            })
          );

          setValores(valoresData);
          setSelectsHabilitados(true);
          console.log(valores);
        })
        .catch((error) => console.error("Error fetching attributes:", error));
    }
    const url = "/listaDeAtributos";

    fetch(url, {
      headers: authHeader(),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error al realizar la solicitud: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setTiposDeProcesos(responseData.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleAgregarValor = (
    event: React.ChangeEvent<HTMLInputElement>,
    nombreAtributo: string
  ) => {
    console.log("hola");
    const { value } = event.target;
    setValores(
      valores.map((valor) => {
        if (valor.atributo.nombre === nombreAtributo) {
          return { ...valor, valor: value };
        } else {
          return valor;
        }
      })
    );
  };
  const handleTiposDeProcesosChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { value } = event.target;
    const selectedCategoria = tiposDeProcesos.find(
      (categoria) => categoria.id === parseInt(value, 10)
    );
    setTipoDeProceso(selectedCategoria || ({} as TipoDeProceso));

    setValores(
      selectedCategoria?.atributos.map((atributo: Atributo) => ({
        id: null,
        atributo: atributo,
        valor: null,
      })) || []
    );
  };

  const renderizarInput = (atributo: Atributo, index: number) => {
    switch (atributo.tipo) {
      case "string":
        return (
          <input
            id={atributo.id.toString()}
            className="form-control"
            type="text"
            name={atributo.nombre}
            //value={valores.find((valor) => valor.atributo.nombre === atributo.nombre)?.valor || ''}
            required={atributo.obligatorio}
            maxLength={atributo.caracteres}
            onChange={(event) => handleAgregarValor(event, atributo.nombre)}
          />
        );
      case "int":
        return (
          <input
            className="form-control"
            id={atributo.id.toString()}
            type="number"
            name={atributo.nombre}
            //value={valores.find((valor) => valor.atributo.nombre === atributo.nombre)?.valor || ''}
            required={atributo.obligatorio}
            min={atributo.minimo}
            max={atributo.maximo}
            step={1 / Math.pow(10, atributo.decimales || 0)}
            onChange={(event) => handleAgregarValor(event, atributo.nombre)}
          />
        );
      case "fecha":
        return (
          <input
            className="form-control"
            id={atributo.id.toString()}
            type="date"
            name={atributo.nombre}
            //value={valores.find((valor) => valor.atributo.nombre === atributo.nombre)?.valor || ''}
            required={atributo.obligatorio}
            onChange={(event) => handleAgregarValor(event, atributo.nombre)}
          />
        );
      default:
        return <input className="form-control" key={atributo.id} type="text" />;
    }
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const nProceso: Proceso = {
      id: 0,
      usuario: null,
      fecha: null,
      valores: valores,
      tipoDeProceso: tipoDeProceso,
    };

    fetch(`/procesos/lote/${loteId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader().Authorization
      },
      body: JSON.stringify(nProceso),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Respuesta del servidor:", data);
      })
      .catch((error) => {
        console.error("Error al crear el proceso:", error);
      });

    fetch(`/procesos/completar/${loteId}/${listId}`, {
      method: "PUT",  
        headers: authHeader(),
      
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error al realizar la solicitud: ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error(error);
      });

    navigate(-1);
  };

  return (
    <div className="container">
      <h2>Nuevo Proceso </h2>
      <div className="col-md-6">
        <label htmlFor="proceso" className="form-label">
          Tipo de Proceso
        </label>
        <select
          className="form-select"
          id="proceso"
          name="proceso"
          value={tipoDeProceso.id}
          onChange={handleTiposDeProcesosChange}
          disabled={selectsHabilitados}
        >
          <option value="">Selecciona el tipo de proceso...</option>
          {tiposDeProcesos.map((proceso) => (
            <option key={proceso.id} value={proceso.id}>
              {proceso.nombre}
            </option>
          ))}
        </select>
      </div>
      <ul></ul>
      {tipoDeProceso && (
        <form className="row g-3" onSubmit={handleSubmit}>
          {tipoDeProceso.atributos?.map((atributo, index) => (
            <div className="col-md-7" key={atributo.id}>
              <label htmlFor={atributo.id.toString()} className="form-label">
                {atributo.nombre}
              </label>
              {renderizarInput(atributo, index)}
            </div>
          ))}
          <div className="col-md-12">
            <button
              type="submit"
              className="btn btn-success"
              disabled={tipoDeProceso.atributos == null}
            >
              Enviar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default CrearProceso;
