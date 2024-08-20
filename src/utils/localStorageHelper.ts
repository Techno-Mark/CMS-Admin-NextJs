export const setLocalStorageItem = (key:any, value:any) => {
    localStorage.setItem(key, value);
    const event = new Event('localStorageUpdate');
    window.dispatchEvent(event);
  };
  