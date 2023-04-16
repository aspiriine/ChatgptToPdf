const { jsPDF } = window.jspdf;

//Run the logic when the page content has loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  runLogic();
} else {
  document.addEventListener('DOMContentLoaded', runLogic);
}

function runLogic() {

    //In the case that the interval exists, clear it
    if (window.addButtonInterval) {
        clearInterval(window.addButtonInterval);
    }

    //Create interval and add it to the window
    window.addButtonInterval = setInterval(
        function () {
            const buttonsContainer = document.querySelector('form > div > div');

            //If the container does not exists
            if (!buttonsContainer) {
                return;
            }

            //If the buttonsContainer does not contain the downloadPdfBtn, add it
            if (!buttonsContainer.querySelector('#downloadPdfBtn') &&
                buttonsContainer.querySelector('button')) {

                //Get the regenerate response button and clone it
                const regenerateResponseBtn = buttonsContainer.querySelector('button');
                const downloadPdfButton = regenerateResponseBtn.cloneNode(true);
    
                //Change the properties and append it to the buttonsContainer
                downloadPdfButton.id = 'downloadPdfBtn';
                downloadPdfButton.innerText = 'Download PDF';
                downloadPdfButton.addEventListener('click', downloadPDF);
    
                buttonsContainer.append(downloadPdfButton);
            }

            //If the buttonsContainer does not contain the downloadPngBtn, add it
            if (!buttonsContainer.querySelector('#downloadPngBtn') &&
                buttonsContainer.querySelector('button')) {

                //Get the regenrate response button and clone it
                const regenerateResponseBtn = buttonsContainer.querySelector('button');
                const downloadPngButton = regenerateResponseBtn.cloneNode(true);
    
                //Change the properties and append it to the buttonsContainer
                downloadPngButton.id = 'downloadPngBtn';
                downloadPngButton.innerText = 'Download PNG';
                downloadPngButton.addEventListener('click', downloadPNG);
    
                buttonsContainer.append(downloadPngButton);

            }

        },
        1000
    );
}

/**
 * Method to download the ChatGTP conversation into a copyable PDF.
 * If not to long, each Question and Answer in a page.
 */
function downloadPDF() {

    //Get all the conversation containers
    let allConversation = document.querySelectorAll('div.group');

    let doc = new jsPDF('p', 'in', 'letter');
    let textSize = 12;
    let lines, verticalOffset = 0.5;

    for (let i = 0; i < allConversation.length; i++) {
        let textBlock = allConversation[i];
        // let listOfPreHeaders = textBlock.querySelectorAll('pre > div > div.flex');
        // listOfPreHeaders.forEach(header => header.parentElement.removeChild(header));

        lines = doc.setFont('Helvetica').setFontSize(textSize).splitTextToSize(textBlock.innerText, 7.5);

        /*
            There exists the case that the lines we are going to render are bigger than the
            content the page is able to show, in that case we are going to slice the content
            in two parts, first 50 lines and the rest in a new page.
        */
        if (lines.length > 50) {
            doc.text(0.5, (verticalOffset + textSize / 72), lines.slice(0, 50));
            doc.addPage();
            verticalOffset = 0.5;
            doc.text(0.5, (verticalOffset + textSize / 72), lines.slice(50));
            verticalOffset += ((lines.slice(50).length + 0.5) * textSize / 72);
        }
        else {
            doc.text(0.5, (verticalOffset + textSize / 72), lines);
            verticalOffset += ((lines.length + 0.5) * textSize / 72);
        }
    
        /* 
            Every two containers (that means question and answer) add a new page 
        */
        if (i % 2 != 0 && i != allConversation.length - 1) {
            doc.addPage();
            verticalOffset = 0.5;
        }
    
    }

    //Get the name of the conversation the user has selected
    let selectedConversationName = document.querySelector('nav a.bg-gray-800').innerText;
    doc.save(`${selectedConversationName}.pdf`);

}

/**
 * Method to download the ChatGTP conversation into PNG file.
 * The user image does not appear in the PNG.
 */
async function downloadPNG() {

    //Get all the conversation containers
    let allConversation = document.querySelectorAll('div.group');

    for (let i = 0; i < allConversation.length; i++) {
        let textBlock = allConversation[i];
        let allImagesFromBlock = textBlock.querySelectorAll('img');

        /* 
            Remove all the img tags from the conversation container because
            it breaks the blob creation
        */
        allImagesFromBlock.forEach(img => img.parentElement.removeChild(img));
    }

    try {
        //Generate blob for the png file 
        let blob = await domtoimage.toBlob(allConversation[0].parentElement);

        //Get the name of the conversation the user has selected
        let selectedConversationName = document.querySelector('nav a.bg-gray-800').innerText;

        //Download png file
        window.saveAs(blob, `${selectedConversationName}.png`);
    } catch (error) {
        console.log('Error downloading the PNG from the conversation ', error);
    }

}
