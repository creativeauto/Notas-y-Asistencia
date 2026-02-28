const grid = document.getElementById("grid");

/* =========================
   CARGAR DATOS AL INICIAR
========================= */

cargarDatos();

if(grid.children.length === 0){
  for(let i=1; i<=6; i++){
    grid.appendChild(crearRamo("Ramo " + i));
  }
}

/* =========================
   CREAR RAMO
========================= */

function crearRamo(nombre){
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <input class="ramo-titulo" value="${nombre}">
    <table>
      <thead>
        <tr>
          <th>Evaluación</th>
          <th>%</th>
          <th>Nota</th>
          <th></th>
        </tr>
      </thead>
      <tbody class="evaluaciones"></tbody>
      <tfoot>
        <tr>
          <td><strong>Total</strong></td>
          <td class="total-porcentaje">0%</td>
          <td></td>
          <td></td>
        </tr>
      </tfoot>
    </table>
    <button class="add-btn">+ Añadir evaluación</button>
    <div class="final-box">0.0</div>
  `;

  const tbody = card.querySelector(".evaluaciones");

  for(let j=1; j<=4; j++){
    tbody.appendChild(crearEvaluacion(j, card));
  }

  card.querySelector(".add-btn").addEventListener("click", ()=>{
    tbody.appendChild(crearEvaluacion(tbody.children.length + 1, card));
    actualizarTotalPorcentaje(card);
    guardarDatos();
  });

  // Guardar si cambian el nombre del ramo
  card.querySelector(".ramo-titulo").addEventListener("input", ()=>{
    guardarDatos();
  });

  actualizarTotalPorcentaje(card);

  return card;
}

/* =========================
   CREAR EVALUACION
========================= */

function crearEvaluacion(numero, card){
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input class="eval-nombre" value="Evaluación ${numero}"></td>
    <td><input type="number" class="porcentaje"></td>
    <td><input type="number" class="nota"></td>
    <td><button class="delete-btn">🗑</button></td>
  `;

  tr.querySelectorAll(".porcentaje, .nota, .eval-nombre").forEach(input=>{
    input.addEventListener("input", ()=>{
      calcular(card);
      actualizarTotalPorcentaje(card);
      guardarDatos();
    });
  });

  tr.querySelector(".delete-btn").addEventListener("click", ()=>{
    const tbody = tr.parentElement;
    tr.remove();
    renumerar(tbody);
    calcular(card);
    actualizarTotalPorcentaje(card);
    guardarDatos();
  });

  return tr;
}

/* =========================
   RENUMERAR
========================= */

function renumerar(tbody){
  const filas = tbody.querySelectorAll("tr");
  filas.forEach((fila, index)=>{
    fila.querySelector(".eval-nombre").value = "Evaluación " + (index + 1);
  });
}

/* =========================
   CALCULAR NOTA FINAL
========================= */

function calcular(card){
  const porcentajes = card.querySelectorAll(".porcentaje");
  const notas = card.querySelectorAll(".nota");
  const finalBox = card.querySelector(".final-box");

  let total = 0;

  for(let i=0; i<notas.length; i++){
    const p = parseFloat(porcentajes[i].value) / 100;
    const n = parseFloat(notas[i].value);

    if(!isNaN(n) && !isNaN(p)){
      total += n * p;
    }
  }

  finalBox.textContent = total.toFixed(1);
  finalBox.style.color = total >= 4 ? "#0a8f3c" : "#c40000";
}

/* =========================
   ACTUALIZAR TOTAL %
========================= */

function actualizarTotalPorcentaje(card){
  const porcentajes = card.querySelectorAll(".porcentaje");
  const totalBox = card.querySelector(".total-porcentaje");

  let total = 0;

  porcentajes.forEach(input=>{
    const p = parseFloat(input.value);
    if(!isNaN(p)){
      total += p;
    }
  });

  totalBox.textContent = total.toFixed(1) + "%";

  if(total >= 99.9 && total <= 100.1){
    totalBox.style.color = "#0a8f3c";
  } else {
    totalBox.style.color = "#c40000";
  }
}

/* =========================
   GUARDAR DATOS
========================= */

function guardarDatos(){
  const ramos = [];

  document.querySelectorAll(".card").forEach(card=>{
    const ramo = {
      titulo: card.querySelector(".ramo-titulo").value,
      evaluaciones: []
    };

    card.querySelectorAll("tbody tr").forEach(tr=>{
      ramo.evaluaciones.push({
        nombre: tr.querySelector(".eval-nombre").value,
        porcentaje: tr.querySelector(".porcentaje").value,
        nota: tr.querySelector(".nota").value
      });
    });

    ramos.push(ramo);
  });

  localStorage.setItem("calculadoraRamos", JSON.stringify(ramos));
}

/* =========================
   CARGAR DATOS
========================= */

function cargarDatos(){
  const datosGuardados = localStorage.getItem("calculadoraRamos");

  if(!datosGuardados) return;

  const ramos = JSON.parse(datosGuardados);
  grid.innerHTML = "";

  ramos.forEach(ramo=>{
    const card = crearRamo(ramo.titulo);
    const tbody = card.querySelector(".evaluaciones");
    tbody.innerHTML = "";

    ramo.evaluaciones.forEach((evalData, index)=>{
      const tr = crearEvaluacion(index+1, card);

      tr.querySelector(".eval-nombre").value = evalData.nombre;
      tr.querySelector(".porcentaje").value = evalData.porcentaje;
      tr.querySelector(".nota").value = evalData.nota;

      tbody.appendChild(tr);
    });

    calcular(card);
    actualizarTotalPorcentaje(card);
    grid.appendChild(card);
  });
}
