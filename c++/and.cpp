#include <stdio.h>
#include <stdlib.h>
#include <iostream>
#define INC(x) x*=2; x+=1

using namespace std;


int main()
{                       
    int i, j;
    for (i = 0, j = 1; i < 5; i++)
        INC(j);
    printf("j = %d\n", j);
}

//上述程式可以等校下方程式
//for (i = 0, j = 1; i < 5; i++)
//    j *= 2;
//j += 1;  // ? 這行不在 for 迴圈內

                 