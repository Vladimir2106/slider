
//переменные для класов слайдера
const GalaryClassName="galary";
const GalaryLineClassName="galary-line";
const GalarySlideClassName="galary-slide";



/*слайдеров может быть много делаем через отдельный клас Гелери */
class Galary{
    constructor(element, option={}) {
        this.containerNode=element; /*контейнер слайдера */
        this.size=element.childElementCount/*возвращает количество елементов слайдера */
        this.currentSlide=0; //можно садать начальный слайдер указав ео индекс
        /*нулевой слайд */
        //console.log(this.containerNode,this.size,this.currentSlide)
        this.currentSlideWash =false;
        this.settings={
            margin: option.margin||0
        }



        this.manageHTML=this.manageHTML.bind(this);//что бы не слетал this для функцции manageHTML
        this.setParam=this.setParam.bind(this);//что бы не слетал this для функцции setParam
        this.events=this.events.bind(this);//что бы не слетал this для функцции events
        this.resizeGalary=this.resizeGalary.bind(this);//что бы не слетал this для функцции resizeGalary
        this.startDrag=this.startDrag.bind(this);
        this.stopDrag=this.stopDrag.bind(this);
        this.dragging=this.dragging.bind(this);
        this.setstyleposition=this.setstyleposition.bind(this);

        this.manageHTML();//функция которая оборачивает HTML в классы 
        this.setParam();//функция которая будет задавать параметры слайдера
        this.events();//функция которая бдет обрабатывать события
    }

    manageHTML(){
        this.containerNode.classList.add(GalaryClassName); //присваиваем контейнеру новый класс galary
        //в контейнере создаем новий дыв и присваиваем ему клас galary-line
        this.containerNode.innerHTML=`
        <div class="${GalaryLineClassName}">
            ${this.containerNode.innerHTML}
        </div>
        `;
        this.LineNode=this.containerNode.querySelector(`.${GalaryLineClassName}`) //получаем это контейнер линию

        //получем масив детей елемента LineNode и обрабатываем его через мап + создаем функцию wrapElementByDiv
        this.slideNodes=Array.from(this.LineNode.children).map((childNode)=>
        wrapElementByDiv({
            element:childNode,
            className:GalarySlideClassName

        })
        )
     console.log(this.slideNodes)
     
    };

    setParam(){
        const cord=this.containerNode.getBoundingClientRect();  //это часть JavaScript DOM, которая предоставляет важные данные о размере и расположении HTML-элемента.
        //console.log(cord)
        this.width=cord.width; //берем ширину контейнера общего
        this.x=-this.currentSlide*(this.width+this.settings.margin);

        this.resetsetstyTransition();//для сброса параметров при ресайзе окна
        //узнаем длину контейнера линии
        this.LineNode.style.width=`${this.size * (this.width +this.settings.margin)}px`;//количество слайдеров умножаем на ширину контейнера
        
        this.setstyleposition();//сброс параметров
        //задаем ширину каждого слайда
        Array.from(this.slideNodes).forEach((slideNode) => {
            slideNode.style.width=`${this.width}px`
            slideNode.style.marginRight=`${this.settings.margin}px`
        })
    }

    events(){
        this.dubounceResize=dubounce(this.resizeGalary);
        window.addEventListener('resize',this.dubounceResize) //изменение слайдера при изменении ширины екрана
        this.LineNode.addEventListener('pointerdown', this.startDrag)//начало события пертягивания 
        window.addEventListener('pointerup', this.stopDrag)//собития остановки перетягивания
        window.addEventListener('pointercancel', this.stopDrag)

    }
    destroy(){
        window.removeEventListener('resize',this.dubounceResize)
        this.LineNode.removeEventListener('pointerdown', this.startDrag)
        window.removeEventListener('pointerup', this.stopDrag)
        window.removeEventListener('pointercancel', this.stopDrag)
    }


    resizeGalary(){
        console.log(1)
        this.setParam(); //пересчет размеров при изменении ширины екрана
    }

    startDrag(evt){
        this.currentSlideWash =false;
        this.clickX=evt.pageX;//начальное определение координатов клика по оси Х
        this.startX=this.x;//первоначальная позиция х
        this.resetsetstyTransition();
        window.addEventListener('pointermove', this.dragging);
    }

    stopDrag(){
        window.removeEventListener('pointermove', this.dragging);
        //console.log(this.currentSlide)
        this.x=-this.currentSlide*(this.width+this.settings.margin);
        this.setstyleposition();
        this.setstyTransition();//для плавной смены слайдов
    }
    dragging(evt){
        this.dragX=evt.pageX;
        const dragShift=this.dragX-this.clickX;
        this.x=this.startX+dragShift;//добавление к стартовой позиции х новую позицию х на которую мы передвинули мишкой или пальцем
        this.setstyleposition();


        //при перетягивании полная смена слайдера а не частичка
        if(
            dragShift>20 &&
            dragShift>0 &&
            !this.currentSlideWash &&
            this.currentSlide > 0
        ){
            this.currentSlideWash=true;
            this.currentSlide=this.currentSlide-1;
        }

        //условие для обратного направления
        if(
            dragShift<-20 &&
            dragShift<0 &&
            !this.currentSlideWash &&
            this.currentSlide < this.size-1
        )
        {
            this.currentSlideWash=true;
            this.currentSlide=this.currentSlide+1;
        }

    }
    setstyleposition(){
        this.LineNode.style.transform=`translate3d(${this.x}px,0,0)`;
    }

    setstyTransition(){
        this.LineNode.style.transition =`all 0.25s ease 0s`;
    }

    resetsetstyTransition(){
        this.LineNode.style.transition =`all 0s ease 0s`;
    }
};

function wrapElementByDiv({element, className}){
    const wraperNode=document.createElement('div');//создаем новий дв
    wraperNode.classList.add(className) //присваиваем ему класс

    element.parentNode.insertBefore(wraperNode, element); // добавляет элемент в список дочерних элементов родителя перед указанным элементом
    wraperNode.appendChild(element) //добавляет узел в конец списка дочерних элементов указанного родительского узла

    return wraperNode;
}

function dubounce(func, time=100){
    let timer;
    return function(event){
        clearTimeout(timer);
        timer =setTimeout(func,time,event);
    }
}
