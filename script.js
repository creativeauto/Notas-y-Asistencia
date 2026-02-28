const grid = document.getElementById("grid");

for(let i=1; i<=6; i++){
  grid.appendChild(crearRamo("Ramo " + i));
}

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
    </table>
    <button class="add-btn">+ Añadir evaluación</button>
    <div class="final-box">0.0</div>
  `;

  const tbody = card.querySelector(".evaluaciones");

  // Crear 4 evaluaciones iniciales
  for(let j=1; j<=4; j++){
    tbody.appendChild(crearEvaluacion(j, card));
  }

  card.querySelector(".add-btn").addEventListener("click", ()=>{
    tbody.appendChild(crearEvaluacion(tbody.children.length + 1, card));
  });

  return card;
}

function crearEvaluacion(numero, card){
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input class="eval-nombre" value="Evaluación ${numero}"></td>
    <td><input type="number" class="porcentaje"></td>
    <td><input type="number" class="nota"></td>
    <td><button class="delete-btn">🗑</button></td>
  `;

  // recalcular cuando escribes
  tr.querySelectorAll(".porcentaje, .nota").forEach(input=>{
    input.addEventListener("input", ()=>{
      calcular(card);
    });
  });

  tr.querySelector(".delete-btn").addEventListener("click", ()=>{
    const tbody = tr.parentElement;
    tr.remove();
    renumerar(tbody);
    calcular(card);
  });

  return tr;
}

function renumerar(tbody){
  const filas = tbody.querySelectorAll("tr");
  filas.forEach((fila, index)=>{
    fila.querySelector(".eval-nombre").value = "Evaluación " + (index + 1);
  });
}

function calcular(card){
  const porcentajes = card.querySelectorAll(".porcentaje");
  const notas = card.querySelectorAll(".nota");
  const finalBox = card.querySelector(".final-box");

  let total = 0;

  for(let i=0;i<notas.length;i++){
    const p = parseFloat(porcentajes[i].value)/100;
    const n = parseFloat(notas[i].value);

    if(!isNaN(n) && !isNaN(p)){
      total += n*p;
    }
  }

  finalBox.textContent = total.toFixed(1);
  finalBox.style.color = total >= 4 ? "#0a8f3c" : "#c40000";
}
