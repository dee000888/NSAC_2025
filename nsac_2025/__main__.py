import pygame

WIDTH=900
HEIGHT=500
window = pygame.display.set_mode((WIDTH, HEIGHT))

def main():
    
    run = True
    while run:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                run = False
                
        _ = window.fill((255, 255, 255))
        pygame.display.update()
                

if __name__ == "__main__":
    main()
