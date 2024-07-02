
export const truncateText = (text: any, charLimit: any): any => {
    if (!text) return ''; 
    if (text.length > charLimit) {
      return text.slice(0, charLimit) + " ...";
    }
    return text;
  };