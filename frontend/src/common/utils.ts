
const setLocalstorageItem = (key:string,value:string) => {
    const setItemEvent = new StorageEvent('storage',{key:key,newValue:value});
    window.dispatchEvent(setItemEvent);
    localStorage.setItem(key,value)
}

export {setLocalstorageItem}