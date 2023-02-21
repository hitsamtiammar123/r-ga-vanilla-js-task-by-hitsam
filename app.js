(function(){
  const backdrop = document.querySelector('.backdrop');
  const totalTaxiElem = document.getElementById('total-taxi');
  const timestampTaxi = document.getElementById('timestamp-taxi');

  const deckgl = new deck.DeckGL({
    container: 'container',
    mapStyle: 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
    initialViewState: {
      longitude: 103.703010666667,
      latitude: 1.3374685,
      zoom: 14,
      pitch: 0,
      bearing: 0,
    },
    controller: true,
    getTooltip: function({object}){
      return (
        object &&
        `\
        Longitude: ${object[0]}
        Latitude: ${object[1]}
        `
      );
    },
    layers: []
  });

  function setScatterPlot(data){
    deckgl.setProps({ layers: [
      new deck.ScatterplotLayer({
        data: data,
        opacity: 0.4,
        radiusScale: 2,
        radiusMinPixels: 1,
        wrapLongitude: true,

        getPosition: (d) => [d[0], d[1]],
        getRadius: () => 20,
        getFillColor: () => {
          return [160, 160, 160];
        },

        pickable: true,
      })
    ]})
}

function formatTimestamp(timestamp){
  var timestampDate = new Date(timestamp);
  var dateString = timestampDate.toTimeString().slice(0, 8);
  var result = `${timestampDate.toISOString().slice(0, 10)} ${dateString}`
  return result;
}


function loadData(date = ''){
  backdrop.style.display = 'flex'
  var params = '';
  if(date){
    params = `?date_time=${date}`
  }

  return fetch('https://api.data.gov.sg/v1/transport/taxi-availability' + params)
  .then(res => res.json())
  .then((res) => {
    console.log({ res });
    if(res.features){
      var feature = res.features[0]
      var data = feature.geometry.coordinates;
      var property = feature.properties;
      var totalTaxi = property.taxi_count
      var timestamp = property.timestamp;

      totalTaxiElem.innerHTML = `Total Taxi: ${totalTaxi}`;
      timestampTaxi.innerHTML = `Timestamp: ${formatTimestamp(timestamp)}`
      setScatterPlot(data);
    }else{
      setScatterPlot([]);
      totalTaxiElem.innerHTML = `Total Taxi: 0`;
      timestampTaxi.innerHTML = `Timestamp: -`
    }
  })
  .catch((err) => {
    console.log('Error on load data', { err });
    alert('An error occured when load data')
  })
  .finally(() => {
    setTimeout(() => {
      backdrop.style.display = 'none'
    }, 1000)
  })
}


  flatpickr("#my-datepicker", {
    enableTime: true,
    dateFormat: "m/d/Y h:i K",
    maxDate: new Date(),
    onClose: function(selectedDates, dateStr, instance){
      console.log('onClose', {selectedDates, dateStr, instance})
      var date = selectedDates[0].toISOString().slice(0, 19);
      loadData(date);
    },
    minuteIncrement: 60,
  });

  loadData();
})();
