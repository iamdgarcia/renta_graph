"""
Scraper for AEAT "Renta - Ayuda técnica" subpages.
Source: https://sede.agenciatributaria.gob.es/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica.html

Downloads each subpage and saves the main text content as an HTML file
under raw/renta_ayuda_tecnica/ for later processing by the compiler.
"""
import os
import requests
import urllib3
from bs4 import BeautifulSoup

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

AEAT_BASE = "https://sede.agenciatributaria.gob.es"
RAW_DIR = os.path.join("raw", "renta_ayuda_tecnica")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; RentaGraph/1.0; research use)"
}

# (path, filename, description)
SUBPAGES = [
    # Index
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica.html",
        "index.html",
        "Renta - Ayuda técnica (índice)",
    ),
    # Obtener referencia
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/obtener-referencia-renta-casilla.html",
        "obtener-referencia-renta-casilla.html",
        "Cómo obtener la referencia del expediente de Renta con casilla 505",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/obtener-referencia-renta-clave.html",
        "obtener-referencia-renta-clave.html",
        "Cómo obtener la referencia del expediente de Renta con Cl@ve",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/obtener-referencia-renta-certificado.html",
        "obtener-referencia-renta-certificado.html",
        "Cómo obtener la referencia del expediente de Renta con certificado",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/obtener-referencia-renta-oficinas-cita.html",
        "obtener-referencia-renta-oficinas-cita.html",
        "Cómo obtener la referencia del expediente de Renta en oficinas con cita",
    ),
    # Obtener borrador
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/obtener-borrador-renta-web-certificado.html",
        "obtener-borrador-renta-web-certificado.html",
        "Cómo obtener el borrador o declaración en Renta WEB con certificado",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/obtener-borrador-renta-web-clave-pin.html",
        "obtener-borrador-renta-web-clave-pin.html",
        "Cómo obtener el borrador o declaración en Renta WEB con Cl@ve",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/obtener-borrador-renta-web-referencia.html",
        "obtener-borrador-renta-web-referencia.html",
        "Cómo obtener el borrador o declaración en Renta WEB con referencia",
    ),
    # Presentar borrador/declaración
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/presentar-borrador-declaracion-mediante-renta-certificado.html",
        "presentar-borrador-declaracion-mediante-renta-certificado.html",
        "Cómo presentar borrador o declaración mediante Renta WEB con certificado",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/presentar-borrador-declaracion-mediante-renta-pin.html",
        "presentar-borrador-declaracion-mediante-renta-pin.html",
        "Cómo presentar borrador o declaración mediante Renta WEB con Cl@ve",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/presentar-borrador-declaracion-mediante-renta-referencia.html",
        "presentar-borrador-declaracion-mediante-renta-referencia.html",
        "Cómo presentar borrador o declaración mediante Renta WEB con referencia",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/presentar-borrador-declaracion-mediante-renta-directa.html",
        "presentar-borrador-declaracion-mediante-renta-directa.html",
        "Cómo presentar borrador o declaración mediante Renta DIRECTA",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/presentar-borrador-renta-web-ingreso-banco.html",
        "presentar-borrador-renta-web-ingreso-banco.html",
        "Cómo presentar declaración mediante Renta WEB con Documento de ingreso en Banco o Caja",
    ),
    # Servicios y modalidades
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/renta-web-open.html",
        "renta-web-open.html",
        "Renta Web Open",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/servicio-renta-web-mediante-apoderamiento.html",
        "servicio-renta-web-mediante-apoderamiento.html",
        "Servicio Renta WEB mediante apoderamiento",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/servicio-renta-web-colaboradores-sociales.html",
        "servicio-renta-web-colaboradores-sociales.html",
        "Servicio Renta WEB para colaboradores sociales",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/que-hacer-si-tiene-dudas-web.html",
        "que-hacer-si-tiene-dudas-web.html",
        "Qué hacer si tienes dudas al cumplimentar la declaración en Renta WEB",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/indicar-asignacion-tributaria-renta-web.html",
        "indicar-asignacion-tributaria-renta-web.html",
        "Cómo indicar la asignación tributaria en Renta WEB",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/modificar-declaracion-presentada.html",
        "modificar-declaracion-presentada.html",
        "Cómo modificar una declaración ya presentada (Autoliquidación rectificativa - Cambio de opción - Anular declaración)",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/ratificar-domicilio-fiscal.html",
        "ratificar-domicilio-fiscal.html",
        "Cómo ratificar el domicilio fiscal",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/presentar-declaracion-mediante-fichero-generado-externo.html",
        "presentar-declaracion-mediante-fichero-generado-externo.html",
        "Cómo presentar la declaración de Renta mediante fichero generado con programa de ayuda",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/inhabilitar-casilla-obtener-referencia.html",
        "inhabilitar-casilla-obtener-referencia.html",
        "Cómo inhabilitar la obtención de la referencia mediante casilla",
    ),
    # APP-AEAT
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/requisitos-tecnicos.html",
        "requisitos-tecnicos.html",
        "Requisitos técnicos para el uso de la APP-AEAT",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/gestion-usuarios.html",
        "gestion-usuarios.html",
        "Gestión de usuarios en la APP-AEAT",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/presentacion-declaracion-clic.html",
        "presentacion-declaracion-clic.html",
        "Presentación Renta en un clic",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/servicios-app.html",
        "servicios-app.html",
        "Gestiones de Renta que ofrece la APP-AEAT",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/gestion-dispositivos-moviles.html",
        "gestion-dispositivos-moviles.html",
        "Gestión de dispositivos móviles por NIF",
    ),
    # Consultas y gestiones
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/consulta-datos-fiscales-on-line.html",
        "consulta-datos-fiscales-on-line.html",
        "Consulta de datos fiscales on line",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/consulta-estado-tramitacion-devolucion-renta.html",
        "consulta-estado-tramitacion-devolucion-renta.html",
        "Consulta del estado de tramitación de una devolución de Renta",
    ),
    (
        "/Sede/codigo_IBAN.shtml",
        "codigo-iban.html",
        "Cómo modificar el código IBAN después de presentar la declaración",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/solicitar-aplazamiento-compensacion-tras-presentacion-renta.html",
        "solicitar-aplazamiento-compensacion-tras-presentacion-renta.html",
        "Cómo solicitar un aplazamiento o compensación después de presentar la declaración de Renta",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/copia-declaracion-ejercicio-anterior.html",
        "copia-declaracion-ejercicio-anterior.html",
        "Cómo obtener una copia de la declaración presentada el ejercicio anterior",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/copia-declaracion.html",
        "copia-declaracion.html",
        "Cómo obtener una copia de la declaración presentada",
    ),
    # Cartera de valores
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/cartera-valores.html",
        "cartera-valores.html",
        "Cartera de Valores: Funcionamiento del servicio de ayuda",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/cartera-valores-colaboradores.html",
        "cartera-valores-colaboradores.html",
        "Cartera de Valores para colaboradores",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/incidencias-tecnicas-cartera-valores.html",
        "incidencias-tecnicas-cartera-valores.html",
        "Incidencias técnicas Cartera de valores",
    ),
    # Supuestos y solicitudes
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/supuestos-habituales-modificacion-renta-web.html",
        "supuestos-habituales-modificacion-renta-web.html",
        "Supuestos habituales de modificación en Renta WEB",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/presentacion-solicitud.html",
        "presentacion-solicitud.html",
        "Presentación de la solicitud",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/consulta-formularios-presentados.html",
        "consulta-formularios-presentados.html",
        "Consulta de formularios presentados",
    ),
    (
        "/Sede/casilla.shtml",
        "casilla-declaracion-ejercicio-anterior.html",
        "Información sobre la casilla de la declaración de Renta del ejercicio anterior",
    ),
    # Incidencias y errores frecuentes
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/casilla-erronea-importe-no-coincide.html",
        "casilla-erronea-importe-no-coincide.html",
        "Casilla 505 errónea: Importe casilla no coincide con el que tenemos en nuestra base de datos",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/cuenta-bancaria-no-consta-nuestra-datos.html",
        "cuenta-bancaria-no-consta-nuestra-datos.html",
        "La cuenta bancaria no consta en nuestra base de datos al solicitar el número de referencia",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/mensaje-referencia-erronea.html",
        "mensaje-referencia-erronea.html",
        "Mensaje Referencia errónea",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/no-aparece-boton-modificar-declaracion-presentada.html",
        "no-aparece-boton-modificar-declaracion-presentada.html",
        "No aparece el botón Modificar declaración presentada",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/bucle-sesion-ha-expirado-referencia.html",
        "bucle-sesion-ha-expirado-referencia.html",
        "La sesión ha expirado o identificación con referencia en bucle",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/imprimir-datos-fiscales-salen-cortados-descolocados.html",
        "imprimir-datos-fiscales-salen-cortados-descolocados.html",
        "Al imprimir los datos fiscales salen cortados o descolocados",
    ),
    # Ejercicios anteriores
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/renta-2024.html",
        "renta-2024.html",
        "Renta 2024",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/renta-2023.html",
        "renta-2023.html",
        "Renta 2023",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/renta-2022.html",
        "renta-2022.html",
        "Renta 2022",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/renta-2021.html",
        "renta-2021.html",
        "Renta 2021",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/renta-2020.html",
        "renta-2020.html",
        "Renta 2020",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/renta-2019.html",
        "renta-2019.html",
        "Renta 2019",
    ),
    (
        "/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/renta-2018.html",
        "renta-2018.html",
        "Renta 2018",
    ),
]


def _extract_main_content(html: str, source_url: str, title: str) -> str:
    """Extract the main article content from a page and return cleaned HTML."""
    soup = BeautifulSoup(html, "html.parser")

    # Try common AEAT content containers in order of preference
    main = (
        soup.find("div", {"id": "contenido"})
        or soup.find("main")
        or soup.find("article")
        or soup.find("div", class_="contenido")
        or soup.find("div", {"id": "content"})
        or soup.body
    )

    if main is None:
        return html

    # Remove nav, header, footer, aside, scripts, styles
    for tag in main.find_all(["nav", "header", "footer", "aside", "script",
                               "style", "noscript"]):
        tag.decompose()

    # Wrap in a minimal document with source metadata
    return (
        f"<!-- source: {source_url} -->\n"
        f"<!-- title: {title} -->\n"
        f"{main.decode_contents().strip()}\n"
    )


def _fetch_page(path: str, filename: str, label: str) -> bool:
    output_path = os.path.join(RAW_DIR, filename)
    if os.path.exists(output_path):
        print(f"  [renta-ayuda] Already downloaded: {filename}")
        return True

    url = AEAT_BASE + path if path.startswith("/") else path
    print(f"  [renta-ayuda] Fetching: {label} ...")
    try:
        resp = requests.get(url, headers=HEADERS, timeout=60, verify=False)
        resp.raise_for_status()
        content = _extract_main_content(resp.text, url, label)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(content)
        size = os.path.getsize(output_path)
        print(f"  [renta-ayuda] Saved {filename} ({size // 1024} KB)")
        return True
    except requests.RequestException as e:
        print(f"  [renta-ayuda] WARNING: Could not fetch {label}: {e}")
        return False


def download_renta_ayuda_tecnica() -> None:
    os.makedirs(RAW_DIR, exist_ok=True)
    ok = 0
    for path, filename, label in SUBPAGES:
        if _fetch_page(path, filename, label):
            ok += 1
    print(f"  [renta-ayuda] Done: {ok}/{len(SUBPAGES)} pages saved to {RAW_DIR}/")
