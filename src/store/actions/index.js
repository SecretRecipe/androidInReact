import store from "../";
import apps from './data/apps';
import {
  favbar,
  page1apps,
  page2apps,
  page3apps,
  page1wid
} from './data/preset';

export const gene_name = () => Math.random().toString(36).substring(2, 10).toLowerCase()

export const dispatchAction = (event) => {
  var action = {
    type: event.target.dataset.action,
    payload: event.target.dataset.payload,
  };

  if (action.type) {
    store.dispatch(action);
  }
};

export const fetchBatteryStatus = () => {
  var battery = navigator.getBattery();
  battery.then((battery) => {
    store.dispatch({
      type: "global/battery",
      payload: {
        charging: battery.charging,
        level: battery.level,
      },
    });
  });
};

export const fillZero = (x)=>{
  return (x<9?"0":"") + x
}

const fetchTime = () => {
  var date = new Date();
  var timestring = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: !store.getState().global.time.military,
  }).split(" ")

  timestring[0] = timestring[0].split(":")

  store.dispatch({type: "global/time", payload: {
    hours: timestring[0][0],
    minutes: fillZero(timestring[0][1]),
    abb: timestring[1]
  }});
  store.dispatch({type: "global/date", payload: {day: date.getDate(), month: date.getMonth(), year: date.getFullYear()}});
};

const fetchActions = () => {
  fetchBatteryStatus();
  fetchTime();
};

export const loadApps = ()=>{
  var tmp = {}
  for (var i = 0; i < apps.length; i++) {
    tmp[apps[i].icon] = apps[i]
  }

  store.dispatch({type: "home/setApps", payload: tmp});
  store.dispatch({type: "home/setFavBar", payload: favbar});

  var homelist = {}
  // page 1
  for (var i = 0; i < page1apps.length; i++) {
    homelist[page1apps[i].icon] = {
      page: 1,
      type: 'app',
      row: [6,7],
      col: [i+1,i+2]
    }
  }

  // adding home screen widgets
  for (var i = 0; i < page1wid.length; i++) {
    homelist[gene_name()] = {
      page: 1,
      type: 'widget',
      row: page1wid[i].slice(0,2),
      col: page1wid[i].slice(2,4),
      widget: page1wid[i][4]
    }
  }

  // page 2
  for (var i = 0; i < page2apps.length; i++) {
    homelist[page2apps[i].icon] = {
      page: 2,
      type: 'app',
      row: [Math.floor(i/4) + 1, Math.floor(i/4) + 2],
      col: [(i%4)+1,(i%4)+2]
    }
  }

  // page 3
  for (var i = 0; i < page3apps.length; i++) {
    homelist[page3apps[i].icon] = {
      page: 3,
      type: 'app',
      row: [Math.floor(i/4) + 1, Math.floor(i/4) + 2],
      col: [(i%4)+1,(i%4)+2]
    }
  }

  Object.keys(homelist).forEach((key, i) => {
    store.dispatch({type: "home/setSlide", payload: {
      id: key,
      data: homelist[key]
    }});
  });

}

export const loadSettings = () => {
  fetchActions();
  loadApps();
  const shortUpdates = setInterval(fetchActions, 10000);

  window.onresize = ()=>{
    store.dispatch({type: "global/resolution", payload: {
      width: window.innerWidth,
      height: window.innerHeight
    }})
  };
};