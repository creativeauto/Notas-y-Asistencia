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

actualizarBotonesAgregar();

/* =========================
   CREAR RAMO
========================= */

function crearRamo(nombre){
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <div class="menu-container">
      <button class="menu-btn">⋮</button>
      <div class="menu-dropdown">
        <div class="menu-item reiniciar">Reiniciar ramo</div>
        <div class="menu-item eliminar">Eliminar ramo</div>
      </div>
    </div>

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
          <td class="nota-final">0.0</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
    <button class="add-btn">+ Añadir evaluación</button>
  `;

  /* ===== MENÚ ===== */

  const menuBtn = card.querySelector(".menu-btn");
  const dropdown = card.querySelector(".menu-dropdown");

  menuBtn.addEventListener("click", (e)=>{
    e.stopPropagation();
    document.querySelectorAll(".menu-dropdown").forEach(d => {
      if(d !== dropdown) d.style.display = "none";
    });
    dropdown.style.display =
      dropdown.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", ()=>{
    dropdown.style.display = "none";
  });

  // Eliminar ramo
  card.querySelector(".eliminar").addEventListener("click", () => {
    const nombreRamo = card.querySelector(".ramo-titulo")?.value || "este ramo";
    const confirmar = confirm(`¿Estás seguro de que quieres eliminar ${nombreRamo}?`);
    if(confirmar){
      card.remove();
      guardarDatos();
      actualizarBotonesAgregar();
    }
  });

  // Reiniciar ramo
  card.querySelector(".reiniciar").addEventListener("click", () => {
    const nombreRamo = card.querySelector(".ramo-titulo")?.value || "este ramo";
    const confirmar = confirm(`¿Estás seguro de que quieres reiniciar ${nombreRamo}?`);
    if(!confirmar) return;

    const tbody = card.querySelector(".evaluaciones");
    tbody.innerHTML = "";

    for(let j=1; j<=4; j++){
      tbody.appendChild(crearEvaluacion(j, card));
    }

    card.querySelector(".ramo-titulo").value = "Ramo";
    calcular(card);
    actualizarTotalPorcentaje(card);
    guardarDatos();
  });

  const tbody = card.querySelector(".evaluaciones");

  for(let j=1; j<=4; j++){
    tbody.appendChild(crearEvaluacion(j, card));
  }

  card.querySelector(".add-btn").addEventListener("click", ()=>{
    tbody.appendChild(crearEvaluacion(tbody.children.length + 1, card));
    actualizarTotalPorcentaje(card);
    guardarDatos();
  });

  card.querySelector(".ramo-titulo").addEventListener("input", ()=>{
    guardarDatos();
  });

  actualizarTotalPorcentaje(card);
  calcular(card);

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
  const notaFinal = card.querySelector(".nota-final");

  if(!notaFinal) return;

  let total = 0;

  for(let i=0; i<notas.length; i++){
    const p = parseFloat(porcentajes[i].value) / 100;
    const n = parseFloat(notas[i].value);

    if(!isNaN(n) && !isNaN(p)){
      total += n * p;
    }
  }

  notaFinal.textContent = total.toFixed(1);
  notaFinal.style.color = total >= 4 ? "#0a8f3c" : "#c40000";
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
  totalBox.style.color =
    (total >= 99.9 && total <= 100.1) ? "#0a8f3c" : "#c40000";
}

/* =========================
   GUARDAR DATOS
========================= */

function guardarDatos(){
  const ramos = [];

  document.querySelectorAll(".card:not(.add-ramo-card)").forEach(card=>{
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

  actualizarBotonesAgregar();
}

/* =========================
   ENTER VERTICAL
========================= */

function activarEnterVertical(){
  document.addEventListener("keydown", function(e){
    if(e.key !== "Enter") return;

    const active = document.activeElement;
    if(!active.matches(".porcentaje, .nota, .eval-nombre, .ramo-titulo")) return;

    e.preventDefault();

    if(active.classList.contains("ramo-titulo")){
      const nextCard = active.closest(".card").nextElementSibling;
      if(nextCard && !nextCard.classList.contains("add-ramo-card")){
        nextCard.querySelector(".ramo-titulo").focus();
      }
      return;
    }

    const td = active.closest("td");
    const tr = active.closest("tr");
    const tbody = tr.parentElement;

    const columnIndex = [...tr.children].indexOf(td);
    const filas = [...tbody.querySelectorAll("tr")];
    const rowIndex = filas.indexOf(tr);
    const nextRow = filas[rowIndex + 1];

    if(nextRow){
      const nextInput = nextRow.children[columnIndex].querySelector("input");
      if(nextInput){
        nextInput.focus();
        nextInput.select();
      }
    }
  });
}
activarEnterVertical();

/* =========================
   BOTONES + RAMO
========================= */

function crearBotonAgregarRamo(){
  const btnCard = document.createElement("div");
  btnCard.className = "card add-ramo-card";

  btnCard.innerHTML = `<button class="add-ramo-btn">+</button>`;

  btnCard.querySelector(".add-ramo-btn").addEventListener("click", ()=>{
    grid.insertBefore(crearRamo("Nuevo Ramo"), btnCard);
    guardarDatos();
    actualizarBotonesAgregar();
  });

  return btnCard;
}

function actualizarBotonesAgregar(){
  document.querySelectorAll(".add-ramo-card").forEach(el => el.remove());
  grid.appendChild(crearBotonAgregarRamo());
  grid.appendChild(crearBotonAgregarRamo());
}
