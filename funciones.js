// Tarea 6 realizada por Baldomero Martinez Alabanda
//Inclidos algunos comentarios extra para mi estudio.

$(document).ready(function () {
  let miMapa; // variable global que me permite recargar el mapa en cada busqueda

  //Cuando pulsamos el botón con id actual 1ª CONSULTA CON FETCH consulta diferente
  $("#actual").click(function () {
    $("#actual").html("<img src='cambia.gif'>"); //gif de espera a la petición

    let localizacion = $("#entrada").val(); //variable para meter lo que se introcuce en la caja de texto.

    //llamada a la api con la localizacion, incluimos idioma y pais curiosamente si le introduzco la , ya lo coje bien, 
    // logica del GEO en 3ª consulta:
    fetch(
      `https://api.weatherapi.com/v1/current.json?key=832dc4d5ff934d1989a105127251305&q=${localizacion} ES&aqi=yes&lang=es`
    )
      .then((respuesta) => {
        return respuesta.json(); //respuesta correcta
      })

      .then((datos_devueltos) => {
        console.log("Datos recibidos:", datos_devueltos); //control
        //Trabajamos con los datos:

        //Variables en las que incluir los datos recogidos en la consulta
        let viento = datos_devueltos.current.wind_kph;
        let lluvia = datos_devueltos.current.precip_mm;
        let calidadAireCO = datos_devueltos.current.air_quality.co;
        let calidadAireNO2 = datos_devueltos.current.air_quality.no2;
        let iconoDir = datos_devueltos.current.condition.icon;
        console.log("Consulta OK");

        document.getElementById("resultado").innerHTML =
          " El clima en : " +
          datos_devueltos.location.name +
          " es " +
          datos_devueltos.current.condition.text +
          "<br> Temperatura :" +
          datos_devueltos.current.temp_c +
          "<br>niveles de CO2: " +
          calidadAireCO +
          " <br>niveles de NO2: " +
          calidadAireNO2;

        // Si hace viento se muestra, dirección incluida:
        if (viento > 0) {
          document.getElementById("resultado").innerHTML +=
            "<br>Viento: " +
            viento +
            " Kh, dirección :" +
            datos_devueltos.current.wind_dir;
        }
        //Si va a llover se muestra la info en mm
        if (lluvia > 0) {
          document.getElementById("resultado").innerHTML +=
            "<br> Habrá precipitaciones de " + lluvia + " mm";
        }

        console.log("Consulta OK"); //control
        console.log(iconoDir);
        //mostramos iono; cambiamos el atributo con Jquuery del icono que ya está en el DOM
        // en las posteriores consultas, las de predicción crearé el elemneto directamente:
        $("#iconoClima").attr("src", `https:${iconoDir}`);
      })
      .catch((error) => {
        console.warn("Error al obtener los datos:", error);
      })
      .finally(() => {
        console.log("terminadas las consultas");
        $("#actual").text("Tiempo Actual");//restauramos botón
        $("#resultado").css("background-color","rgb(160, 102, 235)"); //destacamos el dia actual
      });
  });
  //Cuando pulsamos el botón con id predicción 2ª CONSULTA esta con $AJAX
  $("#prediccion").click(function () {
    $("#prediccion").html("<img src='cambia.gif'>");

    let localizacion = $("#entrada").val();
    //consulta $AJAX:
    $.get(
      `http://api.weatherapi.com/v1/forecast.json?key=832dc4d5ff934d1989a105127251305&q=${localizacion} ES&days=4&aqi=no&lang=es&alerts=no`,

      function (datos_devueltos, estado) {
        //SINTAXIS: API , FUNCION
        if (estado == "success") {
          let cadena = ""; //iniciamos cadena vacia
          //para que no se acumulen iconos reiniciamos cada vez antes del for
          $("#iconoPrediccion").empty();
          console.log("funciona");

          //recorremos arry de resultado desde el 1 pues el 0 lo he mostrado en e anterior:
          for (i = 1; i <= 3; i++) {
            cadena +=
              "Clima a las 5 a.m." +
              datos_devueltos.forecast.forecastday[i].hour[5].condition.text + //recorremos array de horas dentro del bucle
              " a las 14 p.m." +
              datos_devueltos.forecast.forecastday[i].hour[14].condition.text + //mostramos a las 5 y a las 14
              "<br> Temp. máxima : " +
              datos_devueltos.forecast.forecastday[i].day.maxtemp_c +
              "<br> Temp. mínima :" +
              datos_devueltos.forecast.forecastday[i].day.mintemp_c +
              "<br> Amanece " +
              datos_devueltos.forecast.forecastday[i].astro.sunrise +
              "<br> Ocaso :" +
              datos_devueltos.forecast.forecastday[i].astro.sunset +
              " <br> <br>";
            //Cambiamos icono:
            let urlIcono =
              "https:" +
              datos_devueltos.forecast.forecastday[i].day.condition.icon;

            let $icono = $("<img>");
            $icono.attr("src", urlIcono);
            document.getElementById("resultadoPrediccion").innerHTML = cadena;
            $("#iconoPrediccion").append($icono);
            $("#iconoPrediccion").append("<br> <br>");
          }

          //cambiamos botón:
          $("#prediccion").html("Predicción");
        }
      }
    ); // cierre GET
  });
  // Cuando pulsamos el botón con id localización 3ª CONSULTA CON AXIOS
  $("#localizacion").click(async function () {
    $("#localizacion").html("<img src='cambia.gif'>"); // gif de espera a la petición
    
    if (miMapa) {
        miMapa.remove(); // Eliminar la instancia anterior del mapa si existiera
    }

    let localizacionIntroducida = $("#entrada").val().trim(); //Limpiamos la entrada
    let nombreCiudad;
    let codigoPais = "ES"; // Por defecto, buscamos en España
    let partes = localizacionIntroducida.split(','); //contamos si ha introducido coma


    if (partes.length > 1) { //si es mayor a uno es que SI la ha introducido.
        nombreCiudad = partes[0].trim(); // El nombre de la ciudad es la primera parte
        codigoPais = partes[1].trim().toUpperCase(); // Código de país 2ª parte
        console.log(codigoPais);
        
    } else if (partes.length === 1){
        nombreCiudad = localizacionIntroducida; //si solo ha introducido una parte sin comas se tomara el España como pais por defecto
         
      }
      else{
        console("ERROR");//control
      }

    try {
        let datos_devueltos = await axios.get(
            `http://geodb-free-service.wirefreethought.com/v1/geo/places?limit=5&offset=0&types=CITY&namePrefix=${nombreCiudad}&languageCode=es`
        );
        
        console.log("Datos recibidos:", datos_devueltos.data);

        
            let ciudadSeleccionada = null;
            console.log(codigoPais);
            // Recorremos todos las ciudades con mismo nombre
            for (let i = 0; i < datos_devueltos.data.data.length; i++) {
                if (datos_devueltos.data.data[i].countryCode === codigoPais) {
                    ciudadSeleccionada = datos_devueltos.data.data[i];// cojo el objeto del Array, si hubiera 2 ciudads con mismo 
                    //nombre en un pais cojera el último no sé depurar esto, EJ: Springfield
                   
                }
            }


            if (!ciudadSeleccionada) {
                
                alert(`No se encontró '${nombreCiudad}' en ${codigoPais}.`);
            }

            // Ahora trabajamos con la ciudadSeleccionada
            let nombre = ciudadSeleccionada.name;
            let region = ciudadSeleccionada.region;
            let pais = ciudadSeleccionada.country;
            let lat = ciudadSeleccionada.latitude;
            let lon = ciudadSeleccionada.longitude;
            
            console.log(`Latitud: ${lat}, Longitud: ${lon}, Nombre: ${nombre}, Región: ${region}, País: ${pais}`);

            // jQuery para manipular el DOM, en este caso el texto que mostrará la elección:
            $("#eleccion").html(
                "El tiempo en " + nombre + " en " + region + " de " + pais
            );
            
            // jQuery para manipular el DOM, en este caso el Iframe:
            let iframeMapa = $("#mapaEnIframe")[0]; //Jqueri trabaja así, elemento 1º del DOM aunque sólo hay uno
            if (iframeMapa) {
                iframeMapa.src = `mapa.html?lat=${lat}&lon=${lon}`;
            }

        

    } catch (error) {
        console.error("Error al obtener los datos:", error);
        alert("Hubo un error al buscar la localización. Por favor, inténtalo de nuevo más tarde.");
    } finally {
        $("#localizacion").html("Localización"); // Restaurar el texto del botón
    }
});
}); //FIN CARGA DE DOCUMENTO
