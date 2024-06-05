# 42_ft_transcendence
Our ft_transcendence project for 42 Nice, started on May 2nd 2024.  
Our group is called ***"Comment devenir millionaire" par Rachid*** and is comprised of **thepaqui**, **bbourret**, **mmidon**, **ggualerz** and **ndesprez**.

## Modules

> 📝 7 major modules are required to validate with a grade of 100%.  
> 📝 9.5 major modules are required to validate with a grade of 125%.  
> 📝 Note that 2 minor modules count for 1 major module.  

As we are not required to complete all modules, here is our temporary selection:
### Major modules
#### Validated
- Back-end in Django
- Standard user management, authentification and tournaments
- Advanced 3D with ThreeJS
- A second game with user history and match-making
- Distant players (playing on 2 different computers)
#### Maybe
- Multiple players (more than 2 in one game)
- Log management (ELK)
- 2FA + JSON Web Tokens
- WAF or Mod Security + HashiCorp Vault
- AI-controlled player
- Remote authentification (OAuth 42)
---
### Minor modules
#### Validated
- PostgreSQL DB in back-end
- Bootstrap toolkit and Next.js in front-end
- Dashboards for users and game stats
- Multiple browser support
#### Maybe
- Monitoring system
- RGPD compliance

> 📝 Note that we will not do all of them.  
> 📝 This is just the first selection, it will be trimmed down.  

## How to use

- `make`: Builds and launches the project
- `make f`: Build and launches the project with containers in foreground
- `make clean`: Stops the project
- `make fclean`: Stops the project and deletes volumes, images and certificates
- `make re`: clean + all
- `make fre`: clean + f
- `make reset`: fclean + all
- `make freset`: fclean + f

## Useful links

- [Django + PostgreSQL back-end tutorial](https://www.w3schools.com/django/)
- [Django + Next.js project walkthrough](https://youtube.com/playlist?list=PLPSM8rIid1a0SMqmFOfoHRbyfQ5ipQX79&si=Hx5byuBxDHRUbHmL) <-- INSANELY USEFUL!!!
- [How to Use JWT Authentication with Django REST Framework](https://simpleisbetterthancomplex.com/tutorial/2018/12/19/how-to-use-jwt-authentication-with-django-rest-framework.html)
- [Planning DB](https://app.diagrams.net/)
