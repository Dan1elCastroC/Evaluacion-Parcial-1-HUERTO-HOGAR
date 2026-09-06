/* ============================================================
   HUERTO HOGAR - script.js
   Contiene: catálogo de productos, carrito de compras (localStorage),
   regiones/comunas y las validaciones de los formularios del sitio
   y del panel administrativo.
   ============================================================ */

/* ---------- Catálogo de productos ----------
   Por ahora los productos viven en este arreglo. Cuando se conecte
   una base de datos esto se reemplaza por la respuesta del backend,
   pero la forma de cada objeto se mantiene igual. */
const PRODUCTOS = [
  { codigo: "HH-001", nombre: "Tomates Cherry", descripcion: "Bandeja de tomates cherry cultivados sin pesticidas.", precio: 1990, stock: 40, stockCritico: 10, categoria: "Frutas y Verduras", icono: "🍅" },
  { codigo: "HH-002", nombre: "Lechuga Hidropónica", descripcion: "Lechuga fresca cultivada en sistema hidropónico.", precio: 1490, stock: 35, stockCritico: 10, categoria: "Frutas y Verduras", icono: "🥬" },
  { codigo: "HH-003", nombre: "Paltas Hass", descripcion: "Kilo de paltas Hass de la zona central.", precio: 3490, stock: 25, stockCritico: 5, categoria: "Frutas y Verduras", icono: "🥑" },
  { codigo: "HH-004", nombre: "Semillas de Albahaca", descripcion: "Sobre de semillas de albahaca orgánica para huerto propio.", precio: 990, stock: 60, stockCritico: 15, categoria: "Semillas", icono: "🌱" },
  { codigo: "HH-005", nombre: "Semillas de Zanahoria", descripcion: "Sobre de semillas de zanahoria, alto poder germinativo.", precio: 890, stock: 55, stockCritico: 15, categoria: "Semillas", icono: "🌿" },
  { codigo: "HH-006", nombre: "Pala de Jardín", descripcion: "Pala de mano resistente para trasplantes y macetas.", precio: 5990, stock: 20, stockCritico: 5, categoria: "Herramientas", icono: "🛠️" },
  { codigo: "HH-007", nombre: "Regadera 5L", descripcion: "Regadera plástica de 5 litros con rosetón removible.", precio: 6990, stock: 18, stockCritico: 4, categoria: "Herramientas", icono: "🚿" },
  { codigo: "HH-008", nombre: "Compost Orgánico 5kg", descripcion: "Abono orgánico compostado listo para usar en el huerto.", precio: 4490, stock: 30, stockCritico: 8, categoria: "Orgánicos", icono: "🌾" },
];

/* ---------- Blogs de la tienda ---------- */
const BLOGS = [
  { id: 1, titulo: "5 hortalizas fáciles de cultivar en casa", resumen: "Si recién estás empezando tu huerto, estas 5 hortalizas son ideales para partir sin complicarte.", pagina: "blog-detalle-1.html", icono: "🥕" },
  { id: 2, titulo: "Cómo preparar tu propio compost casero", resumen: "Aprende a transformar tus restos de cocina en abono orgánico para tus plantas.", pagina: "blog-detalle-2.html", icono: "♻️" },
];

/* ---------- Regiones y comunas (subconjunto para el formulario) ---------- */
const REGIONES_COMUNAS = {
  "Región Metropolitana de Santiago": ["Santiago", "Providencia", "Maipú", "Puente Alto", "La Florida"],
  "Región del Biobío": ["Concepción", "San Pedro de la Paz", "Talcahuano", "Los Ángeles", "Chillán"],
  "Región de Valparaíso": ["Valparaíso", "Viña del Mar", "Quilpué", "San Antonio"],
  "Región de La Araucanía": ["Temuco", "Villarrica", "Angol"],
  "Región de Los Lagos": ["Puerto Montt", "Osorno", "Castro"],
};

/* ============================================================
   CARRITO DE COMPRAS (persistido en localStorage)
   ============================================================ */
const CARRITO_KEY = "huertohogar_carrito";

function obtenerCarrito() {
  const guardado = localStorage.getItem(CARRITO_KEY);
  return guardado ? JSON.parse(guardado) : [];
}

function guardarCarrito(carrito) {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
  actualizarBadgeCarrito();
}

function agregarAlCarrito(codigo, cantidad = 1) {
  const producto = PRODUCTOS.find((p) => p.codigo === codigo);
  if (!producto) return;

  const carrito = obtenerCarrito();
  const existente = carrito.find((item) => item.codigo === codigo);

  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({ codigo: producto.codigo, nombre: producto.nombre, precio: producto.precio, icono: producto.icono, cantidad });
  }
  guardarCarrito(carrito);
}

function quitarDelCarrito(codigo) {
  const carrito = obtenerCarrito().filter((item) => item.codigo !== codigo);
  guardarCarrito(carrito);
  renderizarCarrito();
}

function cambiarCantidad(codigo, delta) {
  const carrito = obtenerCarrito();
  const item = carrito.find((i) => i.codigo === codigo);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) {
    quitarDelCarrito(codigo);
    return;
  }
  guardarCarrito(carrito);
  renderizarCarrito();
}

function vaciarCarrito() {
  localStorage.removeItem(CARRITO_KEY);
  actualizarBadgeCarrito();
  renderizarCarrito();
}

function totalCarrito() {
  return obtenerCarrito().reduce((acc, item) => acc + item.precio * item.cantidad, 0);
}

function formatoCLP(valor) {
  return "$" + valor.toLocaleString("es-CL");
}

function actualizarBadgeCarrito() {
  const badges = document.querySelectorAll("[data-carrito-badge]");
  const totalItems = obtenerCarrito().reduce((acc, item) => acc + item.cantidad, 0);
  badges.forEach((b) => (b.textContent = totalItems));
}

/* Dibuja el contenido del carrito en carrito.html */
function renderizarCarrito() {
  const contenedor = document.getElementById("carrito-items");
  if (!contenedor) return;

  const carrito = obtenerCarrito();

  if (carrito.length === 0) {
    contenedor.innerHTML = '<p class="text-muted">Tu carrito está vacío. <a href="productos.html">Ver productos</a></p>';
  } else {
    contenedor.innerHTML = carrito
      .map(
        (item) => `
      <div class="carrito-item d-flex align-items-center justify-content-between py-3 border-bottom">
        <div class="d-flex align-items-center gap-3">
          <div class="producto-icono">${item.icono}</div>
          <div>
            <div class="fw-semibold">${item.nombre}</div>
            <div class="text-muted small">${formatoCLP(item.precio)} c/u</div>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary" onclick="cambiarCantidad('${item.codigo}', -1)">-</button>
          <span>${item.cantidad}</span>
          <button class="btn btn-sm btn-outline-secondary" onclick="cambiarCantidad('${item.codigo}', 1)">+</button>
          <button class="btn btn-sm btn-outline-danger ms-2" onclick="quitarDelCarrito('${item.codigo}')">Quitar</button>
        </div>
      </div>`
      )
      .join("");
  }

  const totalEl = document.getElementById("carrito-total");
  if (totalEl) totalEl.textContent = formatoCLP(totalCarrito());
}

/* ============================================================
   RENDER DE PRODUCTOS (página de productos y home)
   ============================================================ */
function tarjetaProducto(p) {
  return `
    <div class="col-md-4 col-sm-6 mb-4">
      <div class="tarjeta-producto h-100">
        <a href="producto-detalle.html?codigo=${p.codigo}" class="producto-imagen-link">
          <div class="producto-icono producto-icono-grande">${p.icono}</div>
        </a>
        <div class="p-3">
          <span class="badge-categoria">${p.categoria}</span>
          <h5 class="mt-2 mb-1"><a href="producto-detalle.html?codigo=${p.codigo}" class="link-producto">${p.nombre}</a></h5>
          <p class="text-muted small mb-2">${p.descripcion}</p>
          <div class="d-flex justify-content-between align-items-center">
            <span class="fw-bold fs-5">${formatoCLP(p.precio)}</span>
            <button class="btn btn-success btn-sm" onclick="agregarAlCarrito('${p.codigo}')">Añadir</button>
          </div>
        </div>
      </div>
    </div>`;
}

function renderizarListaProductos(idContenedor, lista) {
  const contenedor = document.getElementById(idContenedor);
  if (!contenedor) return;
  contenedor.innerHTML = lista.map(tarjetaProducto).join("");
}

/* Página de detalle de un producto, según ?codigo= en la URL */
function renderizarDetalleProducto() {
  const contenedor = document.getElementById("detalle-producto");
  if (!contenedor) return;

  const params = new URLSearchParams(window.location.search);
  const codigo = params.get("codigo");
  const producto = PRODUCTOS.find((p) => p.codigo === codigo) || PRODUCTOS[0];

  contenedor.innerHTML = `
    <div class="col-md-5 text-center mb-4">
      <div class="producto-icono producto-icono-detalle mx-auto">${producto.icono}</div>
    </div>
    <div class="col-md-7">
      <span class="badge-categoria">${producto.categoria}</span>
      <h2 class="mt-2">${producto.nombre}</h2>
      <p class="text-muted">${producto.descripcion}</p>
      <p class="fs-3 fw-bold text-success">${formatoCLP(producto.precio)}</p>
      <p class="small text-muted">Stock disponible: ${producto.stock} unidades</p>
      <div class="d-flex align-items-center gap-2 mb-3">
        <label for="cantidad-detalle" class="form-label mb-0">Cantidad:</label>
        <input type="number" id="cantidad-detalle" class="form-control" style="width:90px" min="1" value="1">
      </div>
      <button class="btn btn-success btn-lg" id="btn-agregar-detalle">Añadir al carrito</button>
    </div>`;

  document.getElementById("btn-agregar-detalle").addEventListener("click", () => {
    const cantidad = parseInt(document.getElementById("cantidad-detalle").value, 10) || 1;
    agregarAlCarrito(producto.codigo, cantidad);
  });
}

/* Dibuja los blogs en blogs.html */
function renderizarBlogs() {
  const contenedor = document.getElementById("lista-blogs");
  if (!contenedor) return;
  contenedor.innerHTML = BLOGS.map(
    (b) => `
    <div class="col-md-6 mb-4">
      <div class="tarjeta-blog h-100">
        <div class="producto-icono producto-icono-grande">${b.icono}</div>
        <div class="p-3">
          <h5>${b.titulo}</h5>
          <p class="text-muted small">${b.resumen}</p>
          <a href="${b.pagina}" class="btn btn-outline-success btn-sm">Leer más</a>
        </div>
      </div>
    </div>`
  ).join("");
}

/* ============================================================
   VALIDACIÓN DE RUN CHILENO (sin puntos ni guión, ej: 19011022K)
   ============================================================ */
function validarRun(run) {
  const limpio = run.trim().toUpperCase();
  if (!/^[0-9]{6,9}[0-9K]$/.test(limpio)) return false;

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);

  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  let dvEsperado = resto.toString();
  if (resto === 11) dvEsperado = "0";
  if (resto === 10) dvEsperado = "K";

  return dv === dvEsperado;
}

/* ============================================================
   HELPERS DE VALIDACIÓN DE FORMULARIOS
   ============================================================ */
function marcarError(input, mensaje) {
  input.classList.add("is-invalid");
  input.classList.remove("is-valid");
  // Si el campo no trae su propio div de mensaje, se agrega uno al vuelo
  // para no depender de que cada página lo declare a mano.
  let feedback = input.parentElement.querySelector(".invalid-feedback");
  if (!feedback) {
    feedback = document.createElement("div");
    feedback.className = "invalid-feedback";
    input.insertAdjacentElement("afterend", feedback);
  }
  feedback.textContent = mensaje;
}

function marcarValido(input) {
  input.classList.remove("is-invalid");
  input.classList.add("is-valid");
}

function correoPermitido(valor) {
  return /^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test(valor.trim());
}

function telefonoValido(valor) {
  return /^[0-9+\s-]{7,15}$/.test(valor.trim());
}

/* Muestra el bloque de éxito de un formulario. Si la página no trae el
   div de éxito ya armado, se crea uno para no obligar a declararlo en
   cada vista. */
function mostrarExitoFormulario(form, exitoId, titulo, mensaje) {
  let exito = document.getElementById(exitoId);
  if (!exito) {
    exito = document.createElement("div");
    exito.id = exitoId;
    exito.className = "alerta-exito";
    form.insertAdjacentElement("afterend", exito);
  }
  exito.innerHTML = `<h5>${titulo}</h5><p class="mb-0">${mensaje}</p>`;
  form.classList.add("d-none");
  exito.classList.remove("d-none");
}

/* ============================================================
   FORMULARIO: INICIO DE SESIÓN
   ============================================================ */
function inicializarFormLogin() {
  const form = document.getElementById("form-login");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let esValido = true;

    const correo = document.getElementById("login-correo");
    const clave = document.getElementById("login-clave");

    if (!correo.value.trim()) {
      marcarError(correo, "El correo es obligatorio.");
      esValido = false;
    } else if (correo.value.length > 100) {
      marcarError(correo, "El correo no puede superar los 100 caracteres.");
      esValido = false;
    } else if (!correoPermitido(correo.value)) {
      marcarError(correo, "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.");
      esValido = false;
    } else {
      marcarValido(correo);
    }

    if (!clave.value) {
      marcarError(clave, "La contraseña es obligatoria.");
      esValido = false;
    } else if (clave.value.length < 4 || clave.value.length > 10) {
      marcarError(clave, "La contraseña debe tener entre 4 y 10 caracteres.");
      esValido = false;
    } else {
      marcarValido(clave);
    }

    if (esValido) {
      mostrarExitoFormulario(form, "login-exito", "¡Bienvenido de vuelta!", "Sesión iniciada correctamente.");
    }
  });
}

/* ============================================================
   FORMULARIO: CONTACTO
   ============================================================ */
function inicializarFormContacto() {
  const form = document.getElementById("form-contacto");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let esValido = true;

    const nombre = document.getElementById("contacto-nombre");
    const correo = document.getElementById("contacto-correo");
    const comentario = document.getElementById("contacto-comentario");

    if (!nombre.value.trim()) {
      marcarError(nombre, "El nombre es obligatorio.");
      esValido = false;
    } else if (nombre.value.length > 100) {
      marcarError(nombre, "Máximo 100 caracteres.");
      esValido = false;
    } else {
      marcarValido(nombre);
    }

    // El correo es opcional en este formulario, pero si se escribe algo se valida.
    if (correo.value.trim()) {
      if (correo.value.length > 100) {
        marcarError(correo, "Máximo 100 caracteres.");
        esValido = false;
      } else if (!correoPermitido(correo.value)) {
        marcarError(correo, "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.");
        esValido = false;
      } else {
        marcarValido(correo);
      }
    } else {
      correo.classList.remove("is-invalid", "is-valid");
    }

    if (!comentario.value.trim()) {
      marcarError(comentario, "El comentario es obligatorio.");
      esValido = false;
    } else if (comentario.value.length > 500) {
      marcarError(comentario, "Máximo 500 caracteres.");
      esValido = false;
    } else {
      marcarValido(comentario);
    }

    if (esValido) {
      mostrarExitoFormulario(form, "contacto-exito", "¡Mensaje enviado!", "Gracias por escribirnos, te responderemos a la brevedad.");
    }
  });
}

/* ============================================================
   FORMULARIO: REGISTRO / USUARIO (mismo set de reglas que pide
   el mantenedor de usuarios del administrador)
   ============================================================ */
function poblarRegiones(selectRegion, selectComuna) {
  Object.keys(REGIONES_COMUNAS).forEach((region) => {
    const opt = document.createElement("option");
    opt.value = region;
    opt.textContent = region;
    selectRegion.appendChild(opt);
  });

  selectRegion.addEventListener("change", () => {
    selectComuna.innerHTML = '<option value="">Selecciona una comuna</option>';
    const comunas = REGIONES_COMUNAS[selectRegion.value] || [];
    comunas.forEach((comuna) => {
      const opt = document.createElement("option");
      opt.value = comuna;
      opt.textContent = comuna;
      selectComuna.appendChild(opt);
    });
  });
}

/* Formulario de registro público (registro.html). Usa sus propios ids
   porque, a diferencia del mantenedor de usuarios del admin, pide
   confirmación de contraseña y un teléfono opcional. */
function inicializarFormRegistro() {
  const form = document.getElementById("form-registro");
  if (!form) return;

  const selectRegion = document.getElementById("registro-region");
  const selectComuna = document.getElementById("registro-comuna");
  if (selectRegion && selectComuna) poblarRegiones(selectRegion, selectComuna);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let esValido = true;

    const run = document.getElementById("registro-run");
    const nombre = document.getElementById("registro-nombre");
    const apellidos = document.getElementById("registro-apellidos");
    const correo = document.getElementById("registro-correo");
    const clave = document.getElementById("registro-clave");
    const confirmarClave = document.getElementById("registro-confirmar-clave");
    const telefono = document.getElementById("registro-telefono");
    const region = document.getElementById("registro-region");
    const comuna = document.getElementById("registro-comuna");
    const direccion = document.getElementById("registro-direccion");

    if (!run.value.trim()) {
      marcarError(run, "El RUN es obligatorio.");
      esValido = false;
    } else if (run.value.length < 7 || run.value.length > 9) {
      marcarError(run, "El RUN debe tener entre 7 y 9 caracteres, sin puntos ni guión.");
      esValido = false;
    } else if (!validarRun(run.value)) {
      marcarError(run, "El RUN ingresado no es válido.");
      esValido = false;
    } else {
      marcarValido(run);
    }

    if (!nombre.value.trim()) {
      marcarError(nombre, "El nombre es obligatorio.");
      esValido = false;
    } else if (nombre.value.length > 50) {
      marcarError(nombre, "Máximo 50 caracteres.");
      esValido = false;
    } else {
      marcarValido(nombre);
    }

    if (!apellidos.value.trim()) {
      marcarError(apellidos, "Los apellidos son obligatorios.");
      esValido = false;
    } else if (apellidos.value.length > 100) {
      marcarError(apellidos, "Máximo 100 caracteres.");
      esValido = false;
    } else {
      marcarValido(apellidos);
    }

    if (!correo.value.trim()) {
      marcarError(correo, "El correo es obligatorio.");
      esValido = false;
    } else if (correo.value.length > 100) {
      marcarError(correo, "Máximo 100 caracteres.");
      esValido = false;
    } else if (!correoPermitido(correo.value)) {
      marcarError(correo, "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.");
      esValido = false;
    } else {
      marcarValido(correo);
    }

    if (!clave.value) {
      marcarError(clave, "La contraseña es obligatoria.");
      esValido = false;
    } else if (clave.value.length < 4 || clave.value.length > 10) {
      marcarError(clave, "La contraseña debe tener entre 4 y 10 caracteres.");
      esValido = false;
    } else {
      marcarValido(clave);
    }

    if (!confirmarClave.value) {
      marcarError(confirmarClave, "Debes confirmar la contraseña.");
      esValido = false;
    } else if (confirmarClave.value !== clave.value) {
      marcarError(confirmarClave, "Las contraseñas no coinciden.");
      esValido = false;
    } else {
      marcarValido(confirmarClave);
    }

    if (telefono.value.trim() && !telefonoValido(telefono.value)) {
      marcarError(telefono, "Ingresa un teléfono válido (solo números, espacios o guiones).");
      esValido = false;
    } else {
      telefono.classList.remove("is-invalid");
      if (telefono.value.trim()) marcarValido(telefono);
    }

    if (!region.value) {
      marcarError(region, "Selecciona una región.");
      esValido = false;
    } else {
      marcarValido(region);
    }

    if (!comuna.value) {
      marcarError(comuna, "Selecciona una comuna.");
      esValido = false;
    } else {
      marcarValido(comuna);
    }

    if (!direccion.value.trim()) {
      marcarError(direccion, "La dirección es obligatoria.");
      esValido = false;
    } else if (direccion.value.length > 300) {
      marcarError(direccion, "Máximo 300 caracteres.");
      esValido = false;
    } else {
      marcarValido(direccion);
    }

    if (esValido) {
      mostrarExitoFormulario(form, "registro-exito", "¡Cuenta creada!", 'Tu registro fue completado correctamente. Ya puedes <a href="login.html">iniciar sesión</a>.');
    }
  });
}

function inicializarFormUsuario(formId, exitoId) {
  const form = document.getElementById(formId);
  if (!form) return;

  const selectRegion = form.querySelector("[data-region]");
  const selectComuna = form.querySelector("[data-comuna]");
  if (selectRegion && selectComuna) poblarRegiones(selectRegion, selectComuna);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let esValido = true;

    const run = form.querySelector("[data-run]");
    const nombre = form.querySelector("[data-nombre]");
    const apellidos = form.querySelector("[data-apellidos]");
    const correo = form.querySelector("[data-correo]");
    const direccion = form.querySelector("[data-direccion]");

    if (!run.value.trim()) {
      marcarError(run, "El RUN es obligatorio.");
      esValido = false;
    } else if (run.value.length < 7 || run.value.length > 9) {
      marcarError(run, "El RUN debe tener entre 7 y 9 caracteres, sin puntos ni guión.");
      esValido = false;
    } else if (!validarRun(run.value)) {
      marcarError(run, "El RUN ingresado no es válido.");
      esValido = false;
    } else {
      marcarValido(run);
    }

    if (!nombre.value.trim()) {
      marcarError(nombre, "El nombre es obligatorio.");
      esValido = false;
    } else if (nombre.value.length > 50) {
      marcarError(nombre, "Máximo 50 caracteres.");
      esValido = false;
    } else {
      marcarValido(nombre);
    }

    if (!apellidos.value.trim()) {
      marcarError(apellidos, "Los apellidos son obligatorios.");
      esValido = false;
    } else if (apellidos.value.length > 100) {
      marcarError(apellidos, "Máximo 100 caracteres.");
      esValido = false;
    } else {
      marcarValido(apellidos);
    }

    if (!correo.value.trim()) {
      marcarError(correo, "El correo es obligatorio.");
      esValido = false;
    } else if (correo.value.length > 100) {
      marcarError(correo, "Máximo 100 caracteres.");
      esValido = false;
    } else if (!correoPermitido(correo.value)) {
      marcarError(correo, "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.");
      esValido = false;
    } else {
      marcarValido(correo);
    }

    if (!direccion.value.trim()) {
      marcarError(direccion, "La dirección es obligatoria.");
      esValido = false;
    } else if (direccion.value.length > 300) {
      marcarError(direccion, "Máximo 300 caracteres.");
      esValido = false;
    } else {
      marcarValido(direccion);
    }

    if (esValido) {
      mostrarExitoFormulario(form, exitoId, "¡Usuario guardado!", "Los cambios se guardaron correctamente.");
    }
  });
}

/* ============================================================
   FORMULARIO: PRODUCTO (panel administrativo)
   ============================================================ */
function inicializarFormProducto() {
  const form = document.getElementById("form-producto");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let esValido = true;

    const codigo = document.getElementById("prod-codigo");
    const nombre = document.getElementById("prod-nombre");
    const descripcion = document.getElementById("prod-descripcion");
    const precio = document.getElementById("prod-precio");
    const stock = document.getElementById("prod-stock");
    const stockCritico = document.getElementById("prod-stock-critico");
    const categoria = document.getElementById("prod-categoria");

    if (!codigo.value.trim()) {
      marcarError(codigo, "El código es obligatorio.");
      esValido = false;
    } else if (codigo.value.trim().length < 3) {
      marcarError(codigo, "El código debe tener al menos 3 caracteres.");
      esValido = false;
    } else {
      marcarValido(codigo);
    }

    if (!nombre.value.trim()) {
      marcarError(nombre, "El nombre es obligatorio.");
      esValido = false;
    } else if (nombre.value.length > 100) {
      marcarError(nombre, "Máximo 100 caracteres.");
      esValido = false;
    } else {
      marcarValido(nombre);
    }

    if (descripcion.value.length > 500) {
      marcarError(descripcion, "Máximo 500 caracteres.");
      esValido = false;
    } else {
      descripcion.classList.remove("is-invalid");
      if (descripcion.value.trim()) marcarValido(descripcion);
    }

    if (precio.value === "" || Number(precio.value) < 0) {
      marcarError(precio, "El precio es obligatorio y no puede ser negativo (0 = producto gratis).");
      esValido = false;
    } else {
      marcarValido(precio);
    }

    if (stock.value === "" || Number(stock.value) < 0 || !Number.isInteger(Number(stock.value))) {
      marcarError(stock, "El stock es obligatorio, entero y no puede ser negativo.");
      esValido = false;
    } else {
      marcarValido(stock);
    }

    if (stockCritico.value !== "" && (Number(stockCritico.value) < 0 || !Number.isInteger(Number(stockCritico.value)))) {
      marcarError(stockCritico, "Debe ser un número entero igual o mayor a 0.");
      esValido = false;
    } else {
      stockCritico.classList.remove("is-invalid");
      if (stockCritico.value !== "") marcarValido(stockCritico);
    }

    if (!categoria.value) {
      marcarError(categoria, "Selecciona una categoría.");
      esValido = false;
    } else {
      marcarValido(categoria);
    }

    if (esValido) {
      mostrarExitoFormulario(form, "producto-exito", "¡Producto guardado!", "Los cambios se guardaron correctamente.");
    }
  });
}

/* ============================================================
   Tabla de productos y usuarios en el panel administrativo
   ============================================================ */
function renderizarTablaProductosAdmin() {
  const cuerpo = document.getElementById("tabla-productos-admin");
  if (!cuerpo) return;
  cuerpo.innerHTML = PRODUCTOS.map(
    (p) => `
    <tr>
      <td>${p.codigo}</td>
      <td>${p.nombre}</td>
      <td>${p.categoria}</td>
      <td>${formatoCLP(p.precio)}</td>
      <td>${p.stock}${p.stock <= p.stockCritico ? ' <span class="badge text-bg-warning">Stock bajo</span>' : ""}</td>
      <td>
        <a href="producto-form.html?codigo=${p.codigo}" class="btn btn-sm btn-outline-secondary">Editar</a>
        <button class="btn btn-sm btn-outline-danger" onclick="this.closest('tr').remove()">Eliminar</button>
      </td>
    </tr>`
  ).join("");
}

const USUARIOS_DEMO = [
  { run: "191102203", nombre: "Camila", apellidos: "Reyes Soto", correo: "camila.reyes@duoc.cl", tipo: "Cliente" },
  { run: "128574910", nombre: "Matías", apellidos: "Fuentes Lagos", correo: "mfuentes@gmail.com", tipo: "Vendedor" },
  { run: "153629871", nombre: "Admin", apellidos: "Sistema", correo: "admin@duoc.cl", tipo: "Administrador" },
];

function renderizarTablaUsuariosAdmin() {
  const cuerpo = document.getElementById("tabla-usuarios-admin");
  if (!cuerpo) return;
  cuerpo.innerHTML = USUARIOS_DEMO.map(
    (u) => `
    <tr>
      <td>${u.run}</td>
      <td>${u.nombre}</td>
      <td>${u.apellidos}</td>
      <td>${u.correo}</td>
      <td>${u.tipo}</td>
      <td>
        <a href="usuario-form.html" class="btn btn-sm btn-outline-secondary">Editar</a>
        <button class="btn btn-sm btn-outline-danger" onclick="this.closest('tr').remove()">Eliminar</button>
      </td>
    </tr>`
  ).join("");
}

/* ============================================================
   INICIALIZACIÓN GENERAL
   Cada función revisa si su elemento existe antes de hacer nada,
   así este mismo archivo sirve para todas las páginas del sitio.
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  actualizarBadgeCarrito();
  renderizarCarrito();
  renderizarListaProductos("lista-productos", PRODUCTOS);
  renderizarListaProductos("lista-productos-home", PRODUCTOS.slice(0, 3));
  renderizarDetalleProducto();
  renderizarBlogs();

  inicializarFormLogin();
  inicializarFormContacto();
  inicializarFormRegistro();
  inicializarFormUsuario("form-usuario", "usuario-exito");
  inicializarFormProducto();

  renderizarTablaProductosAdmin();
  renderizarTablaUsuariosAdmin();

  const btnVaciar = document.getElementById("btn-vaciar-carrito");
  if (btnVaciar) btnVaciar.addEventListener("click", vaciarCarrito);

  // Contador de caracteres del comentario de contacto, ayuda visual simple
  const comentario = document.getElementById("contacto-comentario");
  const contador = document.getElementById("contacto-contador");
  if (comentario && contador) {
    comentario.addEventListener("input", () => {
      contador.textContent = `${comentario.value.length}/500`;
    });
  }
});
