// Install: npm install jspdf html2canvas
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generatePDF(element, user, interpretation, counsellorNote = null) {
  try {
    // Create a loading indicator
    const loadingElement = document.createElement('div');
    loadingElement.style.position = 'fixed';
    loadingElement.style.top = '50%';
    loadingElement.style.left = '50%';
    loadingElement.style.transform = 'translate(-50%, -50%)';
    loadingElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    loadingElement.style.color = 'white';
    loadingElement.style.padding = '20px';
    loadingElement.style.borderRadius = '8px';
    loadingElement.style.zIndex = '10000';
    loadingElement.textContent = 'Generating PDF...';
    document.body.appendChild(loadingElement);

    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get the PDF container - element is the ref to pdf-container div
    const pdfContainer = element.querySelector('#result-pdf');
    if (!pdfContainer) {
      console.error('PDF container #result-pdf not found. Element:', element);
      throw new Error('PDF container #result-pdf not found');
    }

    // Store parent container styles
    const parentContainer = element;
    const originalParentStyle = {
      position: parentContainer.style.position,
      left: parentContainer.style.left,
      top: parentContainer.style.top,
      visibility: parentContainer.style.visibility,
      opacity: parentContainer.style.opacity,
      zIndex: parentContainer.style.zIndex,
      pointerEvents: parentContainer.style.pointerEvents
    };

    // Make parent container visible for html2canvas
    parentContainer.style.position = 'fixed';
    parentContainer.style.left = '0';
    parentContainer.style.top = '0';
    parentContainer.style.visibility = 'visible';
    parentContainer.style.opacity = '1';
    parentContainer.style.zIndex = '9999';
    parentContainer.style.pointerEvents = 'none';

    // Ensure PDF container is visible and has proper styles
    pdfContainer.style.backgroundColor = '#ffffff';
    pdfContainer.style.color = '#000000';
    pdfContainer.style.width = '800px';
    pdfContainer.style.maxWidth = '800px';

    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 300));

    // Convert element to canvas - capture ONCE
    const canvas = await html2canvas(pdfContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 800,
      windowWidth: 800,
      allowTaint: false,
      removeContainer: false
    });

    // Restore original parent styles
    Object.keys(originalParentStyle).forEach(key => {
      if (originalParentStyle[key] !== undefined && originalParentStyle[key] !== '') {
        parentContainer.style[key] = originalParentStyle[key];
      } else {
        parentContainer.style.removeProperty(key);
      }
    });

    // Remove loading indicator
    document.body.removeChild(loadingElement);

    // Calculate PDF dimensions (A4: 210mm x 297mm)
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 10; // 10mm margins
    const contentWidth = imgWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2); // Usable height per page
    
    // Calculate image dimensions
    const imgHeight = (canvas.height * contentWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Calculate how many pages we need
    const totalPages = Math.ceil(imgHeight / contentHeight);
    
    // Add content across pages - each page shows a different portion
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }
      
      // Calculate source Y position (where to start cropping from the canvas)
      const sourceY = page * (canvas.height / totalPages);
      const sourceHeight = Math.min(canvas.height / totalPages, canvas.height - sourceY);
      
      // Create a temporary canvas for this page
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;
      const pageCtx = pageCanvas.getContext('2d');
      
      // Draw the portion of the original canvas for this page
      pageCtx.drawImage(
        canvas,
        0, sourceY, canvas.width, sourceHeight, // Source rectangle
        0, 0, canvas.width, sourceHeight // Destination rectangle
      );
      
      // Calculate destination height for PDF
      const destHeight = (sourceHeight * contentWidth) / canvas.width;
      
      // Add this page's content to PDF
      pdf.addImage(
        pageCanvas.toDataURL('image/png'),
        'PNG',
        margin,
        margin,
        contentWidth,
        destHeight
      );
    }

    // Generate filename
    const fileName = `Career_Report_${user?.full_name?.replace(/\s+/g, '_') || 'Student'}_${new Date().toISOString().split('T')[0]}.pdf`;

    // Save PDF
    pdf.save(fileName);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}
