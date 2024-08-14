import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PokemonDataType } from './types/types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  actualPage: number = 1;
  numberofPages = Array.from({ length: 10 });
  isInitialPage: boolean = false;
  isLastPage: boolean = false;

  offset: number = 0;
  pokemonDetails: PokemonDataType[]= [];

  searching: string = '';
  filter: string | undefined = '';
  errors: string[] = [];

  private apiUrl: string;
  private pokemonsTypesUrl:string;

  pokemons: PokemonDataType[] = [];
  types: string[] = [];

  constructor(){
    this.apiUrl =  `https://pokeapi.co/api/v2/pokemon?limit=12&offset=${this.offset}`;
    this.pokemonsTypesUrl = 'https://pokeapi.co/api/v2/type';
  }

  ngOnInit(): void {
    this.getTypes(this.pokemonsTypesUrl);
    this.getAllPokemons();
  }

  async getAllPokemons(){
    try {

      const data = await fetch(this.apiUrl);

      if(!data.ok)
        throw new Error(`occured an error. status code:  ${data.status}`);

        await data.json().then(res => {
          res.results.forEach(async (item: any, index: number) => {

            const response = await fetch(item.url);

            await response.json().then(({id, name, height, weight, stats, abilities, types}) => {

              this.pokemons.push({id, name, height, weight, stats, abilities, types});
              // console.log(this.pokemons);
            })
          })
    });
    }catch(err: any){
      console.log('something was wrong. status code: ', err.message);
    }
  }

  async getTypes(url: string){

    try {
      const response = await fetch(url);

      if(!response.ok)
        throw new Error(`occured an erro trying to request endpoint. status-message: ${response.status}`);

      await response.json().then( (data) => {
        data.results.forEach((item: any) => this.types.push(item.name));
      });

    } catch(err: any){
      console.log('something was wrong. see the message', err.message);
    }
  }

  increase() {

    if(this.actualPage == 10) return;
    if(this.offset >= 100) return;

    this.offset += 12;

    if(this.actualPage >= 1 && this.actualPage < 10)
      this.actualPage++;

    this.apiUrl =  `https://pokeapi.co/api/v2/pokemon?limit=9&offset=${this.offset}`;
    this.pokemons.length = 0;
    this.getAllPokemons();

  }

  discrease() {

    if(this.actualPage == 1) return;
    if(this.offset <= 0) return;

    this.offset -= 12;

    if(this.actualPage > 1 && this.actualPage <= 10)
      this.actualPage--;

    this.apiUrl =  `https://pokeapi.co/api/v2/pokemon?limit=12&offset=${this.offset}`;
    this.pokemons.length = 0;
    this.getAllPokemons();

  }

  getData(data: any){
    this.pokemonDetails.length = 0;
    this.pokemonDetails.push(data);
  }

  selectPage(page: number){

    this.actualPage = page;
    this.offset = 12*page - 12;

    this.apiUrl =  `https://pokeapi.co/api/v2/pokemon?limit=12&offset=${this.offset}`;
    this.pokemons.length = 0;

    console.log(this.apiUrl);
    this.getAllPokemons();

  }

  closeModal(target: any){

    // search other way for getting this tags using angular:
    const modal: any = document.querySelector('.modal');
    const btnClose: any = document.querySelector('.close');

    if(target.target == modal || target.target == btnClose )
    modal.style.display = 'none';
  }

  handleSearching(event: any){

    this.searching = this.searching.toLowerCase();
    if(!this.searching) {
      this.pokemons.length = 0;
      this.getAllPokemons();
      return
    };

    // searching how to use other way to get the value from select:
    this.filter = document.querySelector('select')?.value;

    switch(this.filter){

      case 'name':
      this.getPokemonsByName(this.searching);
      break;

      case 'id':
       this.getPokemonsById(this.searching);
      break;

      default:
        this.filter = '';
        this.searching = '';

    }
  }

  async getPokemonsByName(text: string){
    const alphabeticOptionalHyphenRegex = /^[a-zA-Z\-]*$/;
    this.pokemons.length = 0;
    this.pokemonDetails.length = 0;

    try {
    if(!alphabeticOptionalHyphenRegex.test(text)){
        this.errors.push('No pokemon with this name :(');
        throw new Error(`occured any error trying to get pokemon by name.`);
    }
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${text}`);

      if(!response.ok){
        this.errors.push('No pokemon with this name :(');
        throw new Error(`occured any error trying to get pokemon by name, status code: ${response.status}`);
      }

      await response.json().then((data) => {
          this.pokemons.push(data);
          this.pokemonDetails.push(data);

          console.log(`pokemons: ${this.pokemons} | pokemon detail: ${this.pokemons}`);
      })
    }catch(err: any){
      this.getAllPokemons();

      setTimeout(() => {
        this.errors.length = 0;
      }, 3500);
      console.log('something was wrong | message: ', err.message);
    }
  }
    async getPokemonsById(text: string){
    const numericRegex = /^[0-9]+$/;

    this.pokemons.length = 0;
    this.pokemonDetails.length = 0;



    try {

      if(!numericRegex.test(text)){
        this.errors.push('No pokemon with this id :(');
        throw new Error(`occured any error trying to get pokemon by id.`);
      }

      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${text}`);
      if(!response.ok){
        this.errors.push('No pokemon with this id :(');
        throw new Error(`occured any error trying to get pokemon by id, status code: ${response.status}`);
      }

      await response.json().then((data) => {
          this.pokemons.push(data);
          this.pokemonDetails.push(data);

          console.log(`pokemons: ${this.pokemons} | pokemon detail: ${this.pokemons}`);
      })
    }catch(err: any){
      this.getAllPokemons();

      setTimeout(() => {
        this.errors.length = 0;
      }, 3500);
      console.log('something was wrong | message: ', err.message);
    }
  }

  refresh(event: any){
    if(!event.target.value){
      this.errors.length = 0;
      this.filter = 'name';
      this.pokemonDetails.length = 0;
      this.pokemons.length = 0;
      this.getAllPokemons();
    }
  }
}
