import React from "react";
import withQuery from "with-query";
import './index.css'

const apiURL = '/BusArrivalv2'
const apiKey = 'DEnHgvTuTcOjAQtuxfzVtw=='
const homeBusStop = 19071
const officeBusStop = 15041

function getParam(type = 'home') {
    return {'BusStopCode': type === 'home' ? homeBusStop : officeBusStop, 'ServiceNo': '166'}
}

const processServices = (apiData, type) => {
    const services = apiData.Services[0]
    const servicesArray = [services.NextBus, services.NextBus2, services.NextBus3]
    const estimatedTimes = servicesArray.map((service, id) => {
        const estimatedArrival = service.EstimatedArrival
        if(estimatedArrival !== "") {
            let arrivalTime = new Date(estimatedArrival)
            const currentDate = new Date();
            const diff = Math.abs(arrivalTime - currentDate)
            const load = service.Load
            let color = 'green'
            switch (load) {
                case 'SEA':
                    color = 'green'
                    break
                case 'SDA':
                    color = 'orange'
                    break
                case 'LDA':
                    color = 'red'
                    break
                default:
                    color = 'white'
            }
            return {'id': id, 'key': id + type, 'estimate': Math.ceil((diff / 1000) / 60), 'color': color}
        }
        return {'id': id, 'key': id + type, 'estimate': 'NA', color: 'white'}
    })
    console.log(estimatedTimes)
    return estimatedTimes
}

// Example POST method implementation:
async function getData(url = '') {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        // credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'AccountKey': apiKey,
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        // redirect: 'follow', // manual, *follow, error
        // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        // body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}

const refreshData = (type, setter) => {
    getData(withQuery(apiURL, getParam(type)))
        .then((apiOut) => {
            const arrivals = processServices(apiOut, type)
            setter(arrivals)
        })
        .catch((err) => {})
}



const Service = props => {
    const {service} = props
    return (<div key={service.key} className={['service', service.color].join(' ')}>
        {service.estimate}
    </div>)
}

const Users = () => {
  // state
  const [home, setHome] = React.useState([])
  const [office, setOffice] = React.useState([])
  // effects
  React.useEffect(() => {
      refreshData('home', setHome)
      refreshData('office', setOffice)
      const interval = setInterval(() => {
          refreshData('home', setHome)
          refreshData('office', setOffice)
      }, 10000)
      return () => clearInterval(interval)
  }, [])
  return (
      <div>
          <h2>BUS 166 from Home</h2>
          <div>
              {home.map((service) => <Service service={service} key={service.key}/>)}
          </div>
          <p>
              Refreshed - 10 seconds ago
          </p>

          <h2>BUS 166 from Office</h2>
          <div>
              {office.map((service) => <Service service={service} key={service.key}/>)}
          </div>
          <p>
              Refreshed - 10 seconds ago
          </p>
      </div>
  );
};
const App = () => (
    <Users/>
);
export default App;